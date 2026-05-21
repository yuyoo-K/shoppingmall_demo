/**
 * 주문 CRUD 컨트롤러
 * - 일반 회원: 본인 주문만, 관리자: 전체 주문 조회·상태 변경
 */
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ORDER_STATUS, ORDER_ITEM_STATUS, PAYMENT_STATUS } = require('../constants/order');
const {
  isValidObjectId,
  httpError,
  generateOrderNumber,
  buildOptionName,
  buildVariantId,
  assertOrderEditable,
  getOrderForUser,
  recalculateOrderAmounts,
  formatOrderDetail,
  resolveMemberDiscount,
} = require('../utils/orderHelpers');
const { assertNoPendingPaymentOrder } = require('../utils/orderDuplicateGuard');

/** 장바구니 항목 → 주문 라인 입력으로 변환 */
const resolveLineItemsFromCart = async (userId, cartItemIds = []) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price stock');
  if (!cart || cart.items.length === 0) {
    throw httpError(400, '장바구니에 담긴 상품이 없습니다.');
  }

  let cartItems = cart.items;
  if (cartItemIds.length > 0) {
    const idSet = new Set(cartItemIds.map(String));
    cartItems = cart.items.filter((item) => idSet.has(String(item._id)));
    if (cartItems.length === 0) {
      throw httpError(400, '선택한 장바구니 항목을 찾을 수 없습니다.');
    }
  }

  return { cart, lines: cartItems };
};

/** 요청 body.items → 주문 라인 입력 */
const resolveLineItemsFromBody = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, '주문할 상품이 필요합니다.');
  }

  const lines = [];
  for (const row of items) {
    const { productId, quantity = 1, size = '', color = '' } = row;
    if (!productId || !isValidObjectId(productId)) {
      throw httpError(400, '유효한 상품 ID가 필요합니다.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw httpError(404, '상품을 찾을 수 없습니다.');
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
      throw httpError(400, '수량은 1개 이상이어야 합니다.');
    }
    if (product.stock === 0) {
      throw httpError(400, `"${product.name}" 상품은 품절입니다.`);
    }
    if (qty > product.stock) {
      throw httpError(400, `"${product.name}" 재고는 ${product.stock}개까지 주문할 수 있습니다.`);
    }

    const normalizedSize = String(size).trim();
    const normalizedColor = String(color).trim();

    lines.push({
      product,
      quantity: qty,
      size: normalizedSize,
      color: normalizedColor,
      unitPrice: product.price,
      productName: product.name,
      optionName: buildOptionName(normalizedSize, normalizedColor),
      variantId: buildVariantId(product._id, normalizedSize, normalizedColor),
    });
  }

  return { cart: null, lines };
};

/** 장바구니 항목 문서 → 주문 라인 스냅샷 */
const mapCartItemToLine = (cartItem) => {
  const product = cartItem.product;
  if (!product) {
    throw httpError(404, '장바구니에 존재하지 않는 상품이 있습니다.');
  }
  if (product.stock === 0) {
    throw httpError(400, `"${cartItem.name}" 상품은 품절입니다.`);
  }
  if (cartItem.quantity > product.stock) {
    throw httpError(400, `"${cartItem.name}" 재고는 ${product.stock}개까지 주문할 수 있습니다.`);
  }

  return {
    product,
    quantity: cartItem.quantity,
    size: cartItem.size,
    color: cartItem.color,
    unitPrice: cartItem.price,
    productName: cartItem.name,
    optionName: buildOptionName(cartItem.size, cartItem.color),
    variantId: buildVariantId(product._id, cartItem.size, cartItem.color),
    cartItemId: cartItem._id,
  };
};

/** GET /api/orders — 주문 목록 (주문별 상품·이미지 포함, 목록 UI용) */
const getOrders = async (req, res) => {
  const isAdmin = req.user.user_type === 'admin';
  const filter = isAdmin ? {} : { user: req.user._id };

  const orders = await Order.find(filter)
    .sort({ orderedAt: -1 })
    .limit(100)
    .populate('user', 'name email')
    .lean();

  if (orders.length === 0) {
    res.json({ success: true, data: [] });
    return;
  }

  const orderIds = orders.map((o) => o._id);
  const orderItems = await OrderItem.find({ order: { $in: orderIds } })
    .populate('product', 'image')
    .sort({ createdAt: 1 })
    .lean();

  const itemsByOrderId = new Map();
  for (const row of orderItems) {
    const key = String(row.order);
    if (!itemsByOrderId.has(key)) itemsByOrderId.set(key, []);
    itemsByOrderId.get(key).push({
      _id: row._id,
      product: row.product?._id,
      productName: row.productName,
      productImage: row.product?.image || '',
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      itemStatus: row.itemStatus,
      optionName: row.optionName,
    });
  }

  const data = orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(String(order._id)) || [],
  }));

  res.json({
    success: true,
    data,
  });
};

/** GET /api/orders/:orderId — 주문 상세 (상품·결제 포함) */
const getOrderById = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  const data = await formatOrderDetail(order);

  res.json({ success: true, data });
};

/** POST /api/orders — 주문 생성 */
const createOrder = async (req, res) => {
  const {
    fromCart = false,
    cartItemIds = [],
    items,
    receiverName,
    receiverPhone,
    zipcode,
    address1,
    address2 = '',
    deliveryRequest = '',
    discountAmount,
    paymentMethod,
  } = req.body;

  if (!receiverName?.trim() || !receiverPhone?.trim() || !zipcode?.trim() || !address1?.trim()) {
    throw httpError(400, '수령인, 연락처, 우편번호, 기본 주소는 필수입니다.');
  }

  let cart = null;
  let rawLines;

  if (fromCart) {
    const resolved = await resolveLineItemsFromCart(req.user._id, cartItemIds);
    cart = resolved.cart;
    rawLines = resolved.lines.map(mapCartItemToLine);
  } else {
    const resolved = await resolveLineItemsFromBody(items);
    rawLines = resolved.lines;
  }

  const discount = resolveMemberDiscount(req.user, discountAmount);

  // 결제 대기 주문이 이미 있으면 새 주문을 막는다(중복 미결제·장바구니 흐름 보호). 동시 요청은 Order 부분 고유 인덱스로도 막는다.
  await assertNoPendingPaymentOrder(req.user._id, httpError);

  /**
   * 트랜잭션 미사용: 로컬 단일 MongoDB 등 retryable writes / 트랜잭션 미지원 배포에서도 주문이 동작하도록 한다.
   * 실패 시 중간 생성분을 정리한다.
   */
  let order = null;
  try {
    const cartItemIdsForOrder = fromCart
      ? rawLines.map((line) => line.cartItemId).filter(Boolean)
      : [];

    order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      orderStatus: ORDER_STATUS.PENDING_PAYMENT,
      totalProductAmount: 0,
      deliveryFee: 0,
      totalPaymentAmount: 0,
      discountAmount: discount,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      zipcode: zipcode.trim(),
      address1: address1.trim(),
      address2: String(address2).trim(),
      deliveryRequest: String(deliveryRequest).trim(),
      cartItemIds: cartItemIdsForOrder,
      orderedAt: new Date(),
    });

    await OrderItem.insertMany(
      rawLines.map((line) => ({
        order: order._id,
        product: line.product._id,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.unitPrice * line.quantity,
        itemStatus: ORDER_ITEM_STATUS.PENDING,
        variantId: line.variantId,
        optionName: line.optionName,
      }))
    );

    await recalculateOrderAmounts(order, null);

    if (paymentMethod) {
      const refreshed = await Order.findById(order._id);
      await Payment.create({
        order: order._id,
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paidAmount: refreshed.totalPaymentAmount,
        requestedAt: new Date(),
      });
    }

    // 장바구니는 결제 완료 시에만 비운다(결제 실패·취소 시 상품 유지).

    const data = await formatOrderDetail(await Order.findById(order._id));

    res.status(201).json({
      success: true,
      message: '주문이 생성되었습니다.',
      data,
    });
  } catch (err) {
    if (order?._id) {
      await OrderItem.deleteMany({ order: order._id });
      await Payment.deleteMany({ order: order._id });
      await Order.findByIdAndDelete(order._id);
    }
    // 부분 고유 인덱스: 이미 미결제 주문이 있는 상태에서 병렬로 생성 시도한 경우
    if (err && err.code === 11000 && String(err.message || '').includes('uniq_user_one_pending_payment')) {
      throw httpError(
        409,
        '결제 대기 중인 주문이 있습니다. 해당 주문 결제를 마치거나 주문을 취소한 뒤 다시 시도해 주세요.'
      );
    }
    throw err;
  }
};

/** 관리자 주문 상태 변경 시 order_items.item_status 동기화 */
const syncOrderItemsWithOrderStatus = async (orderId, orderStatus) => {
  let itemStatus = ORDER_ITEM_STATUS.PENDING;
  if (orderStatus === ORDER_STATUS.PAID) {
    itemStatus = ORDER_ITEM_STATUS.PAID;
  } else if (orderStatus === ORDER_STATUS.PREPARING) {
    itemStatus = ORDER_ITEM_STATUS.PREPARING;
  } else if (orderStatus === ORDER_STATUS.SHIPPING_START) {
    itemStatus = ORDER_ITEM_STATUS.SHIPPING_START;
  } else if (orderStatus === ORDER_STATUS.SHIPPING) {
    itemStatus = ORDER_ITEM_STATUS.SHIPPING;
  } else if (orderStatus === ORDER_STATUS.DELIVERED) {
    itemStatus = ORDER_ITEM_STATUS.DELIVERED;
  } else if (orderStatus === ORDER_STATUS.CANCELLED) {
    itemStatus = ORDER_ITEM_STATUS.CANCELLED;
  }
  await OrderItem.updateMany({ order: orderId }, { itemStatus });
};

/** PUT /api/orders/:orderId — 주문 수정 */
const updateOrder = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  const isAdmin = req.user.user_type === 'admin';
  const { orderStatus, deliveryRequest, receiverName, receiverPhone, zipcode, address1, address2, discountAmount } =
    req.body;

  if (!isAdmin) {
    assertOrderEditable(order);
    if (deliveryRequest !== undefined) order.deliveryRequest = String(deliveryRequest).trim();
    if (receiverName !== undefined) order.receiverName = String(receiverName).trim();
    if (receiverPhone !== undefined) order.receiverPhone = String(receiverPhone).trim();
    if (zipcode !== undefined) order.zipcode = String(zipcode).trim();
    if (address1 !== undefined) order.address1 = String(address1).trim();
    if (address2 !== undefined) order.address2 = String(address2).trim();
  } else {
    if (orderStatus !== undefined) {
      if (!Object.values(ORDER_STATUS).includes(orderStatus)) {
        throw httpError(400, '유효하지 않은 주문 상태입니다.');
      }
      order.orderStatus = orderStatus;
      if (orderStatus === ORDER_STATUS.PAID && !order.paidAt) {
        order.paidAt = new Date();
      }
      if (orderStatus === ORDER_STATUS.CANCELLED && !order.cancelledAt) {
        order.cancelledAt = new Date();
      }
      await syncOrderItemsWithOrderStatus(order._id, orderStatus);
      if (orderStatus === ORDER_STATUS.CANCELLED) {
        await Payment.updateMany(
          { order: order._id, paymentStatus: PAYMENT_STATUS.PENDING },
          { paymentStatus: PAYMENT_STATUS.CANCELLED, cancelledAt: new Date() }
        );
      }
    }
    if (deliveryRequest !== undefined) order.deliveryRequest = String(deliveryRequest).trim();
    if (receiverName !== undefined) order.receiverName = String(receiverName).trim();
    if (receiverPhone !== undefined) order.receiverPhone = String(receiverPhone).trim();
    if (zipcode !== undefined) order.zipcode = String(zipcode).trim();
    if (address1 !== undefined) order.address1 = String(address1).trim();
    if (address2 !== undefined) order.address2 = String(address2).trim();
    if (discountAmount !== undefined) {
      const discount = Number(discountAmount);
      if (Number.isNaN(discount) || discount < 0) {
        throw httpError(400, '할인 금액은 0 이상이어야 합니다.');
      }
      order.discountAmount = discount;
      await recalculateOrderAmounts(order);
    }
  }

  await order.save();
  const data = await formatOrderDetail(order);

  res.json({
    success: true,
    message: '주문이 수정되었습니다.',
    data,
  });
};

/** DELETE /api/orders/:orderId — 주문 취소 (소프트) */
const cancelOrder = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  const isAdmin = req.user.user_type === 'admin';

  if (!isAdmin && order.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
    throw httpError(400, '결제 대기 중인 주문만 취소할 수 있습니다.');
  }

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    throw httpError(400, '이미 취소된 주문입니다.');
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  await order.save();

  await OrderItem.updateMany({ order: order._id }, { itemStatus: ORDER_ITEM_STATUS.CANCELLED });
  await Payment.updateMany(
    { order: order._id, paymentStatus: PAYMENT_STATUS.PENDING },
    { paymentStatus: PAYMENT_STATUS.CANCELLED, cancelledAt: new Date() }
  );

  const data = await formatOrderDetail(order);

  res.json({
    success: true,
    message: '주문이 취소되었습니다.',
    data,
  });
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
};
