/**
 * 관리자 테이블용 상품 표시 헬퍼
 */
import { getShopCategoryLabel } from '@/constants/admin'

export const getProductCategoryLabel = (category) => {
  if (!category) return '-'

  const parts = [category.top, category.bottom, category.accessory]
    .filter(Boolean)
    .map((name) => getShopCategoryLabel(name))

  return parts.length > 0 ? parts.join(' / ') : '-'
}

export const formatProductDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('ko-KR')
}
