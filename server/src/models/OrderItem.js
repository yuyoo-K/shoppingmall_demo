/**
 * 주문 상품 Mongoose 스키마 (order_items)
 * - product_name, unit_price, option_name은 주문 당시 스냅샷
 */
const mongoose = require('mongoose');
const { ORDER_ITEM_STATUS, ORDER_ITEM_STATUS_VALUES } = require('../constants/order');

const orderItemSchema = new mongoose.Schema(
  {
    /** 주문 ID (order_id) */
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, '주문 ID는 필수입니다.'],
    },
    /** 상품 ID (product_id) — 참조용, 표시·정산은 스냅샷 필드 사용 */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '상품 ID는 필수입니다.'],
    },
    /** 주문 당시 상품명 */
    productName: {
      type: String,
      required: [true, '상품명은 필수입니다.'],
      trim: true,
    },
    /** 수량 */
    quantity: {
      type: Number,
      required: [true, '수량은 필수입니다.'],
      min: [1, '수량은 1개 이상이어야 합니다.'],
    },
    /** 주문 당시 단가 */
    unitPrice: {
      type: Number,
      required: [true, '단가는 필수입니다.'],
      min: [0, '단가는 0 이상이어야 합니다.'],
    },
    /** 총 금액 (단가 × 수량) */
    totalPrice: {
      type: Number,
      required: [true, '총 금액은 필수입니다.'],
      min: [0, '총 금액은 0 이상이어야 합니다.'],
    },
    /** 상품별 주문 상태 */
    itemStatus: {
      type: String,
      required: [true, '상품별 주문 상태는 필수입니다.'],
      enum: {
        values: ORDER_ITEM_STATUS_VALUES,
        message: `상품별 주문 상태는 ${ORDER_ITEM_STATUS_VALUES.join(', ')} 중 하나여야 합니다.`,
      },
      default: ORDER_ITEM_STATUS.PENDING,
    },
    /** 옵션 ID (사이즈·색상 조합 등, 선택) */
    variantId: {
      type: String,
      trim: true,
      default: '',
    },
    /** 주문 당시 옵션명 (예: 블랙 / M) */
    optionName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/** 저장 전 총 금액 자동 계산 */
orderItemSchema.pre('validate', function syncTotalPrice() {
  if (this.quantity != null && this.unitPrice != null) {
    this.totalPrice = this.quantity * this.unitPrice;
  }
});

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ product: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
