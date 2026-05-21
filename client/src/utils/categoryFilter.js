/**
 * 관리자 상품 목록: 선택한 카테고리 ID → API 쿼리 파라미터
 */
import { SHOP_CATEGORY_NAMES } from '@/constants/admin'

export const buildCategoryQueryParams = (activeCategoryId) => {
  if (!activeCategoryId || activeCategoryId === 'all') {
    return {}
  }

  if (activeCategoryId === 'shop') {
    return { categoryGroup: 'shop' }
  }

  if (activeCategoryId.startsWith('exhibition:')) {
    return { exhibition: activeCategoryId.replace('exhibition:', '') }
  }

  if (SHOP_CATEGORY_NAMES.includes(activeCategoryId)) {
    return { category: activeCategoryId }
  }

  return {}
}
