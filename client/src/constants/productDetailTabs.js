/**
 * 상품 상세 하단 탭 (상품정보 · 상품후기 · Q&A) 목업 데이터
 */

export const PRODUCT_DETAIL_TABS = [
  { id: 'info', label: '상품정보' },
  { id: 'reviews', label: '상품후기' },
  { id: 'qa', label: '상품 Q&A' },
]

/** 배송·교환 안내 (데모) */
export const PRODUCT_DETAIL_GUIDE = [
  { label: '소재', value: '면 100% (데모 안내)' },
  { label: '제조국', value: '대한민국' },
  { label: '세탁 방법', value: '단독 세탁, 찬물 손세탁 권장' },
  { label: '배송 안내', value: '결제 완료 후 1~3일 이내 출고 (주말·공휴일 제외)' },
  { label: '교환·반품', value: '상품 수령 후 7일 이내 미착용 상품에 한해 가능' },
]

/** 상품후기 목업 */
export const MOCK_PRODUCT_REVIEWS = [
  {
    id: 1,
    author: '김*연',
    rating: 5,
    date: '2024.03.12',
    option: 'M / 블랙',
    text: '핏이 정말 예뻐요. 사이즈도 딱 맞고 재구매 의사 있습니다!',
    helpful: 12,
  },
  {
    id: 2,
    author: '이*준',
    rating: 4,
    date: '2024.02.28',
    option: 'L / 화이트',
    text: '배송도 빠르고 품질이 좋아요. 색상이 사진과 거의 동일합니다.',
    helpful: 8,
  },
  {
    id: 3,
    author: '박*미',
    rating: 5,
    date: '2024.02.15',
    option: 'S / 그레이',
    text: '데일리로 입기 좋아요. 세탁 후에도 형태 잘 유지됩니다.',
    helpful: 5,
  },
]

/** 상품 Q&A 목업 */
export const MOCK_PRODUCT_QA = [
  {
    id: 1,
    status: 'answered',
    isSecret: false,
    author: '최*호',
    date: '2024.03.01',
    question: '사이즈가 정사이즈인가요? 보통 M 입는데 어떤 사이즈를 추천하시나요?',
    answer:
      '안녕하세요. 일반적으로 정사이즈 기준입니다. 평소 M 착용 시 M 사이즈 추천드리며, 여유 있게 입으시려면 L을 권장합니다.',
    answeredAt: '2024.03.02',
  },
  {
    id: 2,
    status: 'answered',
    isSecret: false,
    author: '정*아',
    date: '2024.02.20',
    question: '세탁기 사용 가능한가요?',
    answer: '네, 가능합니다. 다만 찬물 울 코스 또는 손세탁을 권장드립니다.',
    answeredAt: '2024.02.21',
  },
  {
    id: 3,
    status: 'pending',
    isSecret: true,
    author: '한*석',
    date: '2024.03.10',
    question: '비밀글입니다.',
    answer: null,
    answeredAt: null,
  },
]
