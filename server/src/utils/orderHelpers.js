/**
 * 주문 API 공통 유틸
 */
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const { ORDER_STATUS } = require('../constants/order');
const {
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
  MEMBER_DISCOUNT,
} = require('../constants/shipping');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** HTTP 에러 객체 생성 */
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/** 고유 주문번호 생성 */
const generateOrderNumber = () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${ymd}-${suffix}`;
};

/** 사이즈·색상 → 옵션 표시명 */
const buildOptionName = (size = '', color = '') => {
  const parts = [color, size].map((v) => String(v).trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : '단일 옵션';
};

/** 옵션 조합 ID (variant_id) */
const buildVariantId = (productId, size = '', color = '') =>
  `${productId}:${String(color).trim()}:${String(size).trim()}`;

/** 결제 대기 중인 주문만 수정 가능 */
const assertOrderEditable = (order) => {
  if (order.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
    throw httpError(400, '결제 대기 상태의 주문만 수정할 수 있습니다.');
  }
};

/**
 * 본인 주문 또는 관리자 접근 검증
 * @returns {Promise<import('../models/Order')>}
 */
const getOrderForUser = async (orderId, user) => {
  if (!isValidObjectId(orderId)) {
    throw httpError(400, '유효하지 않은 주문 ID입니다.');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw httpError(404, '주문을 찾을 수 없습니다.');
  }

  const isOwner = String(order.user) === String(user._id);
  const isAdmin = user.user_type === 'admin';

  if (!isOwner && !isAdmin) {
    throw httpError(403, '주문에 접근할 권한이 없습니다.');
  }

  return order;
};

/** 배송비 계산 */
const calcDeliveryFee = (totalProductAmount) => {
  if (totalProductAmount <= 0) return 0;
  return totalProductAmount >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
};

/** 주문 금액 필드 재계산 후 저장 */
const recalculateOrderAmounts = async (order, session = null) => {
  const query = OrderItem.find({ order: order._id });
  if (session) query.session(session);

  const items = await query;
  const totalProductAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = order.discountAmount ?? 0;
  const deliveryFee = calcDeliveryFee(totalProductAmount);
  const totalPaymentAmount = Math.max(0, totalProductAmount + deliveryFee - discountAmount);

  order.totalProductAmount = totalProductAmount;
  order.deliveryFee = deliveryFee;
  order.totalPaymentAmount = totalPaymentAmount;

  if (session) {
    await order.save({ session });
  } else {
    await order.save();
  }

  return order;
};

/** 주문 + 상품 + 결제 목록 응답 형식 */
const formatOrderDetail = async (order) => {
  const orderId = order._id;
  const [items, payments] = await Promise.all([
    OrderItem.find({ order: orderId }).sort({ createdAt: 1 }),
    Payment.find({ order: orderId }).sort({ createdAt: -1 }),
  ]);

  return {
    ...order.toObject(),
    items,
    payments,
  };
};

/**
 * 결제 완료된 주문에 연결된 장바구니 줄만 제거한다.
 * @param {import('mongoose').Types.ObjectId} orderId
 */
const clearCartItemsForPaidOrder = async (orderId) => {
  const order = await Order.findById(orderId).select('user cartItemIds').lean();
  if (!order?.cartItemIds?.length) return;

  const cart = await Cart.findOne({ user: order.user });
  if (!cart) return;

  const idSet = new Set(order.cartItemIds.map(String));
  const remaining = cart.items.filter((item) => !idSet.has(String(item._id)));
  if (remaining.length === cart.items.length) return;

  cart.items = remaining;
  await cart.save();
};

/** 일반 회원 주문 시 데모 할인 적용 여부 */
const resolveMemberDiscount = (user, discountAmount) => {
  if (discountAmount != null && discountAmount > 0) {
    return Number(discountAmount);
  }
  if (user.user_type === 'customer') {
    return MEMBER_DISCOUNT;
  }
  return 0;
};

module.exports = {
  isValidObjectId,
  httpError,
  generateOrderNumber,
  buildOptionName,
  buildVariantId,
  assertOrderEditable,
  getOrderForUser,
  calcDeliveryFee,
  recalculateOrderAmounts,
  formatOrderDetail,
  clearCartItemsForPaidOrder,
  resolveMemberDiscount,
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
};
