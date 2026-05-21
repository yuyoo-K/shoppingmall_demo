/**
 * 주문 상품(order_items) CRUD 컨트롤러
 */
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { ORDER_ITEM_STATUS, ORDER_ITEM_STATUS_VALUES } = require('../constants/order');
const {
  isValidObjectId,
  httpError,
  assertOrderEditable,
  getOrderForUser,
  recalculateOrderAmounts,
  buildOptionName,
  buildVariantId,
} = require('../utils/orderHelpers');

/** GET /api/orders/:orderId/items */
const getOrderItems = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user);
  const items = await OrderItem.find({ order: req.params.orderId }).sort({ createdAt: 1 });

  res.json({ success: true, data: items });
};

/** GET /api/orders/:orderId/items/:itemId */
const getOrderItemById = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user);

  if (!isValidObjectId(req.params.itemId)) {
    throw httpError(400, '유효하지 않은 주문 상품 ID입니다.');
  }

  const item = await OrderItem.findOne({ _id: req.params.itemId, order: req.params.orderId });
  if (!item) {
    throw httpError(404, '주문 상품을 찾을 수 없습니다.');
  }

  res.json({ success: true, data: item });
};

/** POST /api/orders/:orderId/items */
const createOrderItem = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  assertOrderEditable(order);

  const { productId, quantity = 1, size = '', color = '', itemStatus } = req.body;

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
  if (qty > product.stock) {
    throw httpError(400, `재고는 ${product.stock}개까지 주문할 수 있습니다.`);
  }

  const normalizedSize = String(size).trim();
  const normalizedColor = String(color).trim();

  const item = await OrderItem.create({
    order: order._id,
    product: product._id,
    productName: product.name,
    quantity: qty,
    unitPrice: product.price,
    totalPrice: product.price * qty,
    itemStatus: itemStatus && ORDER_ITEM_STATUS_VALUES.includes(itemStatus) ? itemStatus : ORDER_ITEM_STATUS.PENDING,
    variantId: buildVariantId(product._id, normalizedSize, normalizedColor),
    optionName: buildOptionName(normalizedSize, normalizedColor),
  });

  await recalculateOrderAmounts(order);

  res.status(201).json({
    success: true,
    message: '주문 상품이 추가되었습니다.',
    data: item,
  });
};

/** PUT /api/orders/:orderId/items/:itemId */
const updateOrderItem = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  assertOrderEditable(order);

  if (!isValidObjectId(req.params.itemId)) {
    throw httpError(400, '유효하지 않은 주문 상품 ID입니다.');
  }

  const item = await OrderItem.findOne({ _id: req.params.itemId, order: order._id });
  if (!item) {
    throw httpError(404, '주문 상품을 찾을 수 없습니다.');
  }

  const { quantity, itemStatus, optionName } = req.body;
  const isAdmin = req.user.user_type === 'admin';

  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
      throw httpError(400, '수량은 1개 이상이어야 합니다.');
    }
    const product = await Product.findById(item.product);
    if (product && qty > product.stock) {
      throw httpError(400, `재고는 ${product.stock}개까지 주문할 수 있습니다.`);
    }
    item.quantity = qty;
  }

  if (itemStatus !== undefined) {
    if (!ORDER_ITEM_STATUS_VALUES.includes(itemStatus)) {
      throw httpError(400, '유효하지 않은 상품별 주문 상태입니다.');
    }
    if (!isAdmin && itemStatus !== ORDER_ITEM_STATUS.PENDING) {
      throw httpError(403, '상품 상태는 관리자만 변경할 수 있습니다.');
    }
    item.itemStatus = itemStatus;
  }

  if (optionName !== undefined) {
    item.optionName = String(optionName).trim();
  }

  await item.save();
  await recalculateOrderAmounts(order);

  res.json({
    success: true,
    message: '주문 상품이 수정되었습니다.',
    data: item,
  });
};

/** DELETE /api/orders/:orderId/items/:itemId */
const deleteOrderItem = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  assertOrderEditable(order);

  if (!isValidObjectId(req.params.itemId)) {
    throw httpError(400, '유효하지 않은 주문 상품 ID입니다.');
  }

  const item = await OrderItem.findOneAndDelete({ _id: req.params.itemId, order: order._id });
  if (!item) {
    throw httpError(404, '주문 상품을 찾을 수 없습니다.');
  }

  const remaining = await OrderItem.countDocuments({ order: order._id });
  if (remaining === 0) {
    throw httpError(400, '주문에 상품이 하나 이상 있어야 합니다. 주문 취소를 이용해 주세요.');
  }

  await recalculateOrderAmounts(order);

  res.json({
    success: true,
    message: '주문 상품이 삭제되었습니다.',
    data: item,
  });
};

module.exports = {
  getOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
