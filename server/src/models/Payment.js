/**
 * 결제 Mongoose 스키마 (payments)
 * - 주문과 분리: 주문 생성 후 결제 실패·재시도 등을 독립적으로 관리
 */
const mongoose = require('mongoose');
const { PAYMENT_METHOD_VALUES, PAYMENT_STATUS, PAYMENT_STATUS_VALUES } = require('../constants/order');

const paymentSchema = new mongoose.Schema(
  {
    /** 주문 ID (order_id) */
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, '주문 ID는 필수입니다.'],
    },
    /** 결제 수단 */
    paymentMethod: {
      type: String,
      required: [true, '결제 수단은 필수입니다.'],
      enum: {
        values: PAYMENT_METHOD_VALUES,
        message: `결제 수단은 ${PAYMENT_METHOD_VALUES.join(', ')} 중 하나여야 합니다.`,
      },
    },
    /** 결제 상태 */
    paymentStatus: {
      type: String,
      required: [true, '결제 상태는 필수입니다.'],
      enum: {
        values: PAYMENT_STATUS_VALUES,
        message: `결제 상태는 ${PAYMENT_STATUS_VALUES.join(', ')} 중 하나여야 합니다.`,
      },
      default: PAYMENT_STATUS.PENDING,
    },
    /** 결제 금액 */
    paidAmount: {
      type: Number,
      required: [true, '결제 금액은 필수입니다.'],
      min: [0, '결제 금액은 0 이상이어야 합니다.'],
    },
    /** 결제 대행사 */
    pgProvider: {
      type: String,
      trim: true,
      default: '',
    },
    /** PG 거래번호 */
    pgTransactionId: {
      type: String,
      trim: true,
      default: '',
    },
    /** 결제 요청 시간 */
    requestedAt: {
      type: Date,
    },
    /** 결제 완료 시간 */
    paidAt: {
      type: Date,
    },
    /** 실패 사유 */
    failedReason: {
      type: String,
      trim: true,
      default: '',
    },
    /** 결제 취소 시간 */
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ pgTransactionId: 1 }, { sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
