/**
 * 주문 생성 전 중복·충돌 방지
 * - 결제 대기(pending_payment) 주문이 이미 있으면 새 주문을 막는다(장바구니 소진 후 재주문 혼선·이중 미결제 방지).
 * - 동시 요청 레이스는 Order 스키마의 부분 고유 인덱스(user + pending_payment)로 보완한다.
 */
const Order = require('../models/Order');
const { ORDER_STATUS } = require('../constants/order');

/**
 * 해당 사용자에게 결제 대기 주문이 남아 있으면 새 주문을 막는다.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {(status: number, message: string) => Error} httpErrorFn — orderHelpers.httpError
 */
const assertNoPendingPaymentOrder = async (userId, httpErrorFn) => {
  const existing = await Order.findOne({
    user: userId,
    orderStatus: ORDER_STATUS.PENDING_PAYMENT,
  })
    .select('orderNumber')
    .lean();

  if (existing) {
    throw httpErrorFn(
      409,
      '결제 대기 중인 주문이 있습니다. 해당 주문 결제를 마치거나 주문을 취소한 뒤 다시 시도해 주세요.'
    );
  }
};

module.exports = {
  assertNoPendingPaymentOrder,
};
