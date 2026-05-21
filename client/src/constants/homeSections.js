/**
 * 홈 페이지 섹션별 제목·CTA·콘텐츠 묶음
 */
import {
  FEATURED_PRODUCTS,
  OFFLINE_CLASSES,
  REVIEWS,
  SALE_PRODUCTS,
} from '@/constants/home'

/** 메인 히어로 배너 */
export const HERO_CONTENT = {
  image:
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80',
  date: '2023년 1월',
  title: '신상품',
  cta: '지금 확인하기',
  ctaHref: '#shop',
}

/** 중간 프로모션 배너 */
export const PROMO_BANNER = {
  image:
    'https://images.unsplash.com/photo-1460353581641-37baddab0a0e?w=1600&q=80',
  title: '베스트 30 · 최대 50% 할인',
  subtitle: '2023 베스트 30선 제품을 최대 50% 가격에 만나보세요.',
  cta: '쇼핑하기',
  ctaHref: '#shop',
}

/** 상품 기획전 섹션 (목업 데이터용) */
export const PRODUCT_SECTIONS = [
  {
    id: 'shop',
    title: '스몰레터 티셔츠 기획전',
    subtitle: '쇼핑몰 MD 추천',
    products: FEATURED_PRODUCTS,
    sale: false,
  },
  {
    title: '시즌 오프 상품',
    subtitle: '최대 70% 할인 시즌 오프 상품들',
    products: SALE_PRODUCTS,
    sale: true,
  },
]

/** 고객 리뷰 섹션 */
export const REVIEW_SECTION = {
  id: 'community',
  title: '고객 리뷰',
  subtitle: '실제 구매 후기를 확인해 보세요',
  reviews: REVIEWS,
}

/** 오프라인 클래스 섹션 */
export const CLASS_SECTION = {
  id: 'class',
  title: '오프라인 클래스',
  subtitle: '패션 디자인 & 제작 클래스를 만나보세요',
  classes: OFFLINE_CLASSES,
}
