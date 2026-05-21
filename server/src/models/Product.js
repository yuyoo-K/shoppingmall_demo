/**
 * 상품 Mongoose 스키마
 * - SKU, 이름, 가격, 카테고리(상의/하의/악세서리), 이미지 URL
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU는 필수입니다.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, '상품 이름은 필수입니다.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, '상품 가격은 필수입니다.'],
      min: [0, '상품 가격은 0 이상이어야 합니다.'],
    },
    category: {
      top: {
        type: String,
        trim: true,
        default: '',
      },
      bottom: {
        type: String,
        trim: true,
        default: '',
      },
      accessory: {
        type: String,
        trim: true,
        default: '',
      },
    },
    image: {
      type: String,
      required: [true, '상품 이미지는 필수입니다.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    /** 선택 가능 사이즈 목록 */
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    /** 선택 가능 색상 목록 */
    colors: {
      type: [String],
      default: ['블랙', '화이트', '그레이'],
    },
    /** 재고 수량 (수량 선택 상한) */
    stock: {
      type: Number,
      default: 99,
      min: [0, '재고는 0 이상이어야 합니다.'],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ 'category.top': 1, 'category.bottom': 1 });

module.exports = mongoose.model('Product', productSchema);
