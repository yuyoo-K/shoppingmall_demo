/**
 * 장바구니 Mongoose 스키마
 * - 사용자 1명당 장바구니 1개
 * - 담은 상품별로 사이즈·색상·수량 저장
 */
const mongoose = require('mongoose');

/** 장바구니에 담긴 상품 한 줄 */
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '상품 ID는 필수입니다.'],
    },
    quantity: {
      type: Number,
      required: [true, '수량은 필수입니다.'],
      min: [1, '수량은 1개 이상이어야 합니다.'],
      default: 1,
    },
    size: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    /** 담을 당시 단가 (상품 가격 변경 대비 스냅샷) */
    price: {
      type: Number,
      required: [true, '단가는 필수입니다.'],
      min: [0, '단가는 0 이상이어야 합니다.'],
    },
    /** 목록 표시용 스냅샷 */
    name: {
      type: String,
      trim: true,
      required: [true, '상품명은 필수입니다.'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 ID는 필수입니다.'],
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/** 사용자별 장바구니 조회 */
cartSchema.index({ user: 1 }, { unique: true });

/** 동일 상품·옵션 중복 담기 방지용 (애플리케이션에서 조합 키로 비교) */
cartSchema.index({ user: 1, 'items.product': 1 });

/**
 * 장바구니 소계 (상품 금액 합계)
 * @returns {number}
 */
cartSchema.methods.getSubtotal = function getSubtotal() {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * 장바구니 총 수량
 * @returns {number}
 */
cartSchema.methods.getTotalQuantity = function getTotalQuantity() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
