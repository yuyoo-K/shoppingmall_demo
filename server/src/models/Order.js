/**
 * 주문 Mongoose 스키마 (orders)
 * - 배송지는 주문 시점 스냅샷으로 저장 (회원 주소 변경과 무관하게 유지)
 */
const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_STATUS_VALUES } = require('../constants/order');

const orderSchema = new mongoose.Schema(
  {
    /** 주문번호 (고유) */
    orderNumber: {
      type: String,
      required: [true, '주문번호는 필수입니다.'],
      unique: true,
      trim: true,
    },
    /** 회원 ID (user_id) */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '회원 ID는 필수입니다.'],
    },
    /**
     * 주문 상태 (목록 탭 분류)
     * - paid, preparing → 상품준비중
     * - shipping_start → 배송시작
     * - shipping → 배송중
     * - delivered → 배송완료
     * - cancelled → 주문취소
     */
    orderStatus: {
      type: String,
      required: [true, '주문 상태는 필수입니다.'],
      enum: {
        values: ORDER_STATUS_VALUES,
        message: `주문 상태는 ${ORDER_STATUS_VALUES.join(', ')} 중 하나여야 합니다.`,
      },
      default: ORDER_STATUS.PENDING_PAYMENT,
    },
    /** 상품 총액 */
    totalProductAmount: {
      type: Number,
      required: [true, '상품 총액은 필수입니다.'],
      min: [0, '상품 총액은 0 이상이어야 합니다.'],
    },
    /** 배송비 */
    deliveryFee: {
      type: Number,
      required: [true, '배송비는 필수입니다.'],
      min: [0, '배송비는 0 이상이어야 합니다.'],
      default: 0,
    },
    /** 최종 결제 금액 */
    totalPaymentAmount: {
      type: Number,
      required: [true, '최종 결제 금액은 필수입니다.'],
      min: [0, '최종 결제 금액은 0 이상이어야 합니다.'],
    },
    /** 할인 금액 */
    discountAmount: {
      type: Number,
      min: [0, '할인 금액은 0 이상이어야 합니다.'],
      default: 0,
    },
    /** 수령인 (주문 시점 복사) */
    receiverName: {
      type: String,
      required: [true, '수령인은 필수입니다.'],
      trim: true,
    },
    /** 수령인 연락처 (주문 시점 복사) */
    receiverPhone: {
      type: String,
      required: [true, '수령인 연락처는 필수입니다.'],
      trim: true,
    },
    /** 우편번호 (주문 시점 복사) */
    zipcode: {
      type: String,
      required: [true, '우편번호는 필수입니다.'],
      trim: true,
    },
    /** 기본 주소 (주문 시점 복사) */
    address1: {
      type: String,
      required: [true, '기본 주소는 필수입니다.'],
      trim: true,
    },
    /** 상세 주소 (주문 시점 복사) */
    address2: {
      type: String,
      required: [true, '상세 주소는 필수입니다.'],
      trim: true,
      default: '',
    },
    /** 배송 요청사항 */
    deliveryRequest: {
      type: String,
      trim: true,
      default: '',
    },
    /** 장바구니에서 주문한 줄 ID 목록 — 결제 완료 시에만 장바구니에서 제거 */
    cartItemIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      default: [],
    },
    /** 주문일 */
    orderedAt: {
      type: Date,
      required: [true, '주문일은 필수입니다.'],
      default: Date.now,
    },
    /** 결제 완료일 */
    paidAt: {
      type: Date,
    },
    /** 취소일 */
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, orderedAt: -1 });
orderSchema.index({ orderStatus: 1 });
/** 회원당 동시에 미결제 주문은 최대 1건(병렬 요청·이중 클릭 시 나머지는 DB에서 거절) */
orderSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { orderStatus: ORDER_STATUS.PENDING_PAYMENT },
    name: 'uniq_user_one_pending_payment',
  }
);

module.exports = mongoose.model('Order', orderSchema);
