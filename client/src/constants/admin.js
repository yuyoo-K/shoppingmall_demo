/**
 * 관리자 화면 메뉴·카테고리·상품 목업 데이터
 */

/** 좌측 관리자 메뉴 */
export const ADMIN_MENU = [
  { id: 'dashboard', label: '대시보드', icon: '📊' },
  { id: 'users', label: '사용자 관리', icon: '👥' },
  {
    id: 'shopping',
    label: '쇼핑',
    icon: '🛍️',
    children: [
      { id: 'products', label: '상품관리', path: '/admin' },
      { id: 'orders', label: '주문관리', path: '/admin/orders' },
      { id: 'cancel', label: '취소관리', path: '/admin/cancellations' },
      { id: 'return', label: '반품관리' },
      { id: 'exchange', label: '교환관리' },
      { id: 'review', label: '리뷰관리' },
      { id: 'inquiry', label: '문의관리', badge: 1 },
      { id: 'points', label: '포인트' },
      { id: 'coupons', label: '쿠폰' },
      { id: 'shop-settings', label: '쇼핑 설정' },
    ],
  },
  { id: 'reservation', label: '예약', icon: '📅' },
  { id: 'content', label: '콘텐츠 관리', icon: '📝' },
  { id: 'marketing', label: '마케팅', icon: '📣' },
  { id: 'apps', label: '앱 관리', icon: '🧩' },
  { id: 'stats', label: '통계', icon: '📈' },
  { id: 'settings', label: '설정', icon: '⚙️' },
]

/** 상품 상태 탭 (데모용 건수) */
export const PRODUCT_STATUS_TABS = [
  { id: 'all', label: '전체', count: 9 },
  { id: 'selling', label: '판매중', count: 9 },
  { id: 'soldout', label: '품절', count: 0 },
  { id: 'hidden', label: '숨김', count: 0 },
]

/** API·DB와 동일한 쇼핑 카테고리 코드 */
export const SHOP_CATEGORY_NAMES = [
  'NEW ARRIVAL',
  'TOP',
  'OUTER',
  'PANTS',
  'DRESS',
  'SKIRT',
  'BAG',
  'SHOES',
  'ACC',
]

/** 화면 표시용 카테고리 한글명 (필터 값은 SHOP_CATEGORY_NAMES 유지) */
export const SHOP_CATEGORY_LABELS = {
  'NEW ARRIVAL': '신상품',
  TOP: '상의',
  OUTER: '아우터',
  PANTS: '팬츠',
  DRESS: '원피스',
  SKIRT: '스커트',
  BAG: '가방',
  SHOES: '신발',
  ACC: '액세서리',
}

/** 카테고리 한글명 조회 (없으면 원문 반환) */
export const getShopCategoryLabel = (name) => SHOP_CATEGORY_LABELS[name] || name

export const CATEGORIES = [
  { id: 'all', label: '전체 카테고리' },
  {
    id: 'shop',
    label: '쇼핑',
    children: SHOP_CATEGORY_NAMES,
  },
]

/** 기획전 코드 (API 필터 값) */
export const EXHIBITIONS = [
  'SPECIAL ITEMS',
  'SUMMER T-SHIRTS',
  'BEST SELLER',
  'MD PICK',
]

/** 기획전 화면 표시명 */
export const EXHIBITION_LABELS = {
  'SPECIAL ITEMS': '스페셜 아이템',
  'SUMMER T-SHIRTS': '여름 티셔츠',
  'BEST SELLER': '베스트셀러',
  'MD PICK': 'MD 추천',
}

export const getExhibitionLabel = (name) => EXHIBITION_LABELS[name] || name

/** 관리자 테이블 데모용 목업 상품 */
export const MOCK_PRODUCTS = [
  {
    id: 9,
    name: 'Unsplash 환경 로고 플레인 티셔츠',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=80',
    badges: ['NEW', 'SALE'],
    variants: '크기 4종, 색상 2종',
    price: 19900,
    category: 'TOP',
    exhibition: 'SUMMER T-SHIRTS',
    status: '판매중',
    stock: 332,
    createdAt: '2023-01-10',
    updatedAt: '2023-01-15',
  },
  {
    id: 8,
    name: '오버핏 울 블렌드 코트',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&q=80',
    badges: ['HOT'],
    variants: '크기 3종',
    price: 89000,
    category: 'OUTER',
    exhibition: 'BEST SELLER',
    status: '판매중',
    stock: 119,
    createdAt: '2023-01-08',
    updatedAt: '2023-01-14',
  },
  {
    id: 7,
    name: '데일리 와이드 슬랙스',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=120&q=80',
    badges: ['MD'],
    variants: '크기 4종, 색상 3종',
    price: 45900,
    category: 'PANTS',
    exhibition: 'MD PICK',
    status: '판매중',
    stock: 256,
    createdAt: '2023-01-05',
    updatedAt: '2023-01-12',
  },
  {
    id: 6,
    name: '플리츠 미디 스커트',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0e122?w=120&q=80',
    badges: ['NEW'],
    variants: '크기 2종',
    price: 32900,
    category: 'SKIRT',
    exhibition: 'SPECIAL ITEMS',
    status: '판매중',
    stock: 88,
    createdAt: '2023-01-03',
    updatedAt: '2023-01-11',
  },
  {
    id: 5,
    name: '미니멀 레더 숄더백',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&q=80',
    badges: ['SALE'],
    variants: '색상 2종',
    price: 54900,
    category: 'BAG',
    exhibition: 'SPECIAL ITEMS',
    status: '판매중',
    stock: 45,
    createdAt: '2022-12-28',
    updatedAt: '2023-01-09',
  },
  {
    id: 4,
    name: '클래식 화이트 스니커즈',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80',
    badges: [],
    variants: '크기 5종',
    price: 69000,
    category: 'SHOES',
    exhibition: 'BEST SELLER',
    status: '판매중',
    stock: 201,
    createdAt: '2022-12-20',
    updatedAt: '2023-01-08',
  },
  {
    id: 3,
    name: '실버 드롭 이어링',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=120&q=80',
    badges: ['NEW', 'HOT'],
    variants: '단일',
    price: 15900,
    category: 'ACC',
    exhibition: 'MD PICK',
    status: '판매중',
    stock: 412,
    createdAt: '2022-12-15',
    updatedAt: '2023-01-05',
  },
  {
    id: 2,
    name: '린넨 블렌드 셔츠 드레스',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059a58101?w=120&q=80',
    badges: ['MD'],
    variants: '크기 3종',
    price: 52900,
    category: 'DRESS',
    exhibition: 'SUMMER T-SHIRTS',
    status: '판매중',
    stock: 67,
    createdAt: '2022-12-10',
    updatedAt: '2023-01-03',
  },
  {
    id: 1,
    name: '베이직 코튼 티셔츠',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=120&q=80',
    badges: ['SALE'],
    variants: '크기 4종, 색상 4종',
    price: 19900,
    category: 'TOP',
    exhibition: 'SUMMER T-SHIRTS',
    status: '판매중',
    stock: 520,
    createdAt: '2022-12-01',
    updatedAt: '2023-01-01',
  },
]
