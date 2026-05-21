/**
 * 주문·결제 관련 상태·수단 상수
 */

/** 주문 상태 (orders.order_status) */
const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPING_START: 'shipping_start',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

/** 주문 상품별 상태 (order_items.item_status) */
const ORDER_ITEM_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPING_START: 'shipping_start',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const ORDER_ITEM_STATUS_VALUES = Object.values(ORDER_ITEM_STATUS);

/** 결제 수단 (payments.payment_method) */
const PAYMENT_METHOD = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  KAKAO_PAY: 'kakao_pay',
  NAVER_PAY: 'naver_pay',
};

const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

/** 결제 상태 (payments.payment_status) */
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_VALUES,
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
};
