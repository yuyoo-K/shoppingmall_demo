/**
 * 상품 등록·수정 폼 상수 및 변환 함수
 */

export const SKU_MAX_LENGTH = 40
export const NAME_MAX_LENGTH = 100
export const IMAGE_MAX_SIZE_MB = 10
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif'

/** 카테고리 select 옵션 (value는 API payload 형식) */
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: 'top:NEW ARRIVAL', label: '상의 · 신상품' },
  { value: 'top:TOP', label: '상의 · TOP' },
  { value: 'top:OUTER', label: '상의 · 아우터' },
  { value: 'top:DRESS', label: '상의 · 원피스' },
  { value: 'bottom:PANTS', label: '하의 · 팬츠' },
  { value: 'bottom:SKIRT', label: '하의 · 스커트' },
  { value: 'accessory:BAG', label: '악세서리 · 가방' },
  { value: 'accessory:SHOES', label: '악세서리 · 신발' },
  { value: 'accessory:ACC', label: '악세서리 · 액세서리' },
]

/** select value → API category 객체 */
export const mapCategoryValueToPayload = (categoryValue) => {
  const [type, name] = categoryValue.split(':')

  return {
    top: type === 'top' ? name : '',
    bottom: type === 'bottom' ? name : '',
    accessory: type === 'accessory' ? name : '',
  }
}

/** 서버 상품 → 폼 state */
export const productToFormState = (product) => {
  const { category } = product
  let categoryValue = ''

  if (category?.top) {
    categoryValue = `top:${category.top}`
  } else if (category?.bottom) {
    categoryValue = `bottom:${category.bottom}`
  } else if (category?.accessory) {
    categoryValue = `accessory:${category.accessory}`
  }

  return {
    sku: product.sku ?? '',
    name: product.name ?? '',
    price: product.price !== undefined && product.price !== null ? String(product.price) : '',
    category: categoryValue,
    image: product.image ?? '',
    description: product.description ?? '',
  }
}

export const INITIAL_PRODUCT_FORM = {
  sku: '',
  name: '',
  price: '',
  category: '',
  image: '',
  description: '',
}
