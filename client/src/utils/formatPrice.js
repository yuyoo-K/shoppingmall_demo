/** 원화 가격 포맷 (예: ₩29,000) */
export const formatPrice = (price) => `₩${price.toLocaleString('ko-KR')}`

/** 원 단위 표기 (예: 29,000원) */
export const formatWon = (price) => `${Number(price).toLocaleString('ko-KR')}원`
