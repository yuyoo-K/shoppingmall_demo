/**
 * 결제(payments) CRUD 컨트롤러
 * - 주문과 분리된 결제 생성·완료·실패·취소 처리
 */
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const {
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  ORDER_STATUS,
  ORDER_ITEM_STATUS,
} = require('../constants/order');
const {
  isValidObjectId,
  httpError,
  getOrderForUser,
  assertOrderEditable,
  clearCartItemsForPaidOrder,
} = require('../utils/orderHelpers');
const {
  assertPaidMatchesOrder,
  isVerifySkipped,
  hasVerifyCredentials,
} = require('../utils/portonePaymentVerify');

/** 결제 완료 시 주문·주문 상품 상태 동기화 및 장바구니에서 주문 줄 제거 */
const syncOrderOnPaymentComplete = async (orderId) => {
  const now = new Date();
  await Order.findByIdAndUpdate(orderId, {
    orderStatus: ORDER_STATUS.PAID,
    paidAt: now,
  });
  await OrderItem.updateMany({ order: orderId }, { itemStatus: ORDER_ITEM_STATUS.PAID });
  await clearCartItemsForPaidOrder(orderId);
};

/** GET /api/orders/:orderId/payments */
const getOrderPayments = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user);
  const payments = await Payment.find({ order: req.params.orderId }).sort({ createdAt: -1 });

  res.json({ success: true, data: payments });
};

/** GET /api/orders/:orderId/payments/:paymentId */
const getPaymentById = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user);

  if (!isValidObjectId(req.params.paymentId)) {
    throw httpError(400, '유효하지 않은 결제 ID입니다.');
  }

  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    order: req.params.orderId,
  });

  if (!payment) {
    throw httpError(404, '결제 정보를 찾을 수 없습니다.');
  }

  res.json({ success: true, data: payment });
};

/** POST /api/orders/:orderId/payments — 결제 요청 생성 */
const createPayment = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  assertOrderEditable(order);

  const { paymentMethod, paidAmount, pgProvider, pgTransactionId } = req.body;

  if (!paymentMethod || !PAYMENT_METHOD_VALUES.includes(paymentMethod)) {
    throw httpError(400, '유효한 결제 수단이 필요합니다.');
  }

  const amount = paidAmount != null ? Number(paidAmount) : order.totalPaymentAmount;
  if (Number.isNaN(amount) || amount < 0) {
    throw httpError(400, '결제 금액은 0 이상이어야 합니다.');
  }

  const payment = await Payment.create({
    order: order._id,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    paidAmount: amount,
    pgProvider: pgProvider ? String(pgProvider).trim() : '',
    pgTransactionId: pgTransactionId ? String(pgTransactionId).trim() : '',
    requestedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: '결제 요청이 생성되었습니다.',
    data: payment,
  });
};

/** PUT /api/orders/:orderId/payments/:paymentId — 결제 상태 갱신 */
const updatePayment = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user);
  const isAdmin = req.user.user_type === 'admin';

  if (!isValidObjectId(req.params.paymentId)) {
    throw httpError(400, '유효하지 않은 결제 ID입니다.');
  }

  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    order: order._id,
  });

  if (!payment) {
    throw httpError(404, '결제 정보를 찾을 수 없습니다.');
  }

  const { paymentStatus, pgProvider, pgTransactionId, failedReason, paidAmount } = req.body;

  if (paymentStatus !== undefined) {
    // 결제창 결과 반영(성공/실패/취소)은 일반 회원도 가능
    // - 단, 본인 주문에 한해 pending 상태에서만 전환 허용
    // - 임의 조작 방지를 위해 금액(paidAmount) 변경은 관리자만 가능
    if (!PAYMENT_STATUS_VALUES.includes(paymentStatus)) {
      throw httpError(400, '유효하지 않은 결제 상태입니다.');
    }

    if (!isAdmin) {
      if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) {
        throw httpError(400, '대기 중인 결제만 상태를 변경할 수 있습니다.');
      }

      const allowed = [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED];
      if (!allowed.includes(paymentStatus)) {
        throw httpError(403, '결제 상태 변경 권한이 없습니다.');
      }
    }

    // 일반 회원이 결제 완료로 올릴 때: 포트원 API로 주문번호(merchant_uid)·금액·imp_uid를 검증한다.
    if (paymentStatus === PAYMENT_STATUS.COMPLETED && !isAdmin) {
      const skipVerify = isVerifySkipped();
      if (!skipVerify) {
        if (!hasVerifyCredentials()) {
          throw httpError(
            503,
            '서버에 포트원 REST API 키(PORTONE_IMP_KEY, PORTONE_IMP_SECRET)가 설정되어 있지 않아 결제를 검증할 수 없습니다. 관리자에게 문의하거나 .env를 확인해 주세요.'
          );
        }
        const impUid =
          pgTransactionId !== undefined && pgTransactionId !== null && String(pgTransactionId).trim() !== ''
            ? String(pgTransactionId).trim()
            : String(payment.pgTransactionId || '').trim();
        if (!impUid) {
          throw httpError(
            400,
            '결제 완료 검증을 위해 포트원 거래번호(imp_uid)가 필요합니다. pgTransactionId 필드를 보내 주세요.'
          );
        }
        try {
          await assertPaidMatchesOrder(impUid, {
            merchantUid: order.orderNumber,
            amount: order.totalPaymentAmount,
          });
        } catch (e) {
          const msg = e.message || '포트원 결제 검증에 실패했습니다.';
          throw httpError(400, msg);
        }
      }
    }

    payment.paymentStatus = paymentStatus;

    if (paymentStatus === PAYMENT_STATUS.COMPLETED) {
      payment.paidAt = new Date();
      payment.failedReason = '';
      await syncOrderOnPaymentComplete(order._id);
    }

    if (paymentStatus === PAYMENT_STATUS.FAILED) {
      payment.failedReason = failedReason ? String(failedReason).trim() : '결제에 실패했습니다.';
    }

    if (paymentStatus === PAYMENT_STATUS.CANCELLED) {
      payment.cancelledAt = new Date();
    }
  }

  // PG 정보는 결제 결과 반영 시점에 함께 저장할 수 있다.
  if (pgProvider !== undefined) payment.pgProvider = String(pgProvider).trim();
  if (pgTransactionId !== undefined) payment.pgTransactionId = String(pgTransactionId).trim();

  // 금액 수정은 관리자만 허용
  if (paidAmount !== undefined) {
    if (!isAdmin) {
      throw httpError(403, '결제 금액은 관리자만 변경할 수 있습니다.');
    }
    const amount = Number(paidAmount);
    if (Number.isNaN(amount) || amount < 0) {
      throw httpError(400, '결제 금액은 0 이상이어야 합니다.');
    }
    payment.paidAmount = amount;
  }

  await payment.save();

  res.json({
    success: true,
    message: '결제 정보가 수정되었습니다.',
    data: payment,
  });
};

/** DELETE /api/orders/:orderId/payments/:paymentId — 결제 취소 */
const cancelPayment = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user);

  if (!isValidObjectId(req.params.paymentId)) {
    throw httpError(400, '유효하지 않은 결제 ID입니다.');
  }

  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    order: req.params.orderId,
  });

  if (!payment) {
    throw httpError(404, '결제 정보를 찾을 수 없습니다.');
  }

  if (payment.paymentStatus === PAYMENT_STATUS.COMPLETED) {
    throw httpError(400, '완료된 결제는 삭제할 수 없습니다. 환불 처리를 이용해 주세요.');
  }

  if (payment.paymentStatus === PAYMENT_STATUS.CANCELLED) {
    throw httpError(400, '이미 취소된 결제입니다.');
  }

  payment.paymentStatus = PAYMENT_STATUS.CANCELLED;
  payment.cancelledAt = new Date();
  await payment.save();

  res.json({
    success: true,
    message: '결제가 취소되었습니다.',
    data: payment,
  });
};

module.exports = {
  getOrderPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  cancelPayment,
};
