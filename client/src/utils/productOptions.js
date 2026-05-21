/**
 * 상품 상세 옵션(사이즈·색상·수량) 기본값 및 카테고리별 추론
 */

const DEFAULT_APPAREL_SIZES = ['S', 'M', 'L', 'XL']
const DEFAULT_SHOE_SIZES = ['230', '240', '250', '260', '270']
const DEFAULT_ACCESSORY_SIZES = ['FREE']
const DEFAULT_COLORS = ['블랙', '화이트', '그레이', '베이지']
const DEFAULT_STOCK = 99
const MAX_QUANTITY_CAP = 10

const SHOE_CATEGORIES = new Set(['SHOES'])
const ACCESSORY_CATEGORIES = new Set(['BAG', 'ACC'])

/** 카테고리에 맞는 기본 사이즈 목록 */
const inferDefaultSizes = (category) => {
  const names = [category?.top, category?.bottom, category?.accessory].filter(Boolean)

  if (names.some((name) => SHOE_CATEGORIES.has(name))) {
    return DEFAULT_SHOE_SIZES
  }

  if (names.some((name) => ACCESSORY_CATEGORIES.has(name))) {
    return DEFAULT_ACCESSORY_SIZES
  }

  return DEFAULT_APPAREL_SIZES
}

/** API 상품 → 상세 페이지 옵션 세트 */
export const getProductOptionSets = (product) => {
  if (!product) {
    return { sizes: [], colors: [], stock: 0, maxQuantity: 1 }
  }

  const sizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : inferDefaultSizes(product.category)

  const colors =
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : DEFAULT_COLORS

  const stock =
    typeof product.stock === 'number' && product.stock >= 0 ? product.stock : DEFAULT_STOCK

  const maxQuantity = Math.max(1, Math.min(stock, MAX_QUANTITY_CAP))

  return { sizes, colors, stock, maxQuantity }
}

/** 색상 칩 배경용 (간단 매핑) */
export const COLOR_SWATCH_MAP = {
  블랙: '#111111',
  화이트: '#ffffff',
  그레이: '#9e9e9e',
  베이지: '#d4c4a8',
  네이비: '#1e3a5f',
  브라운: '#6d4c41',
  레드: '#c62828',
  블루: '#1565c0',
}

export const getColorSwatch = (colorName) => COLOR_SWATCH_MAP[colorName] || '#e9ecef'
