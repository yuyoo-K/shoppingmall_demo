/**
 * 주문·결제 UI 상수 (서버 order.js의 payment_method와 동일한 값 사용)
 */

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: '신용·체크카드' },
  { value: 'bank_transfer', label: '계좌이체' },
  { value: 'kakao_pay', label: '카카오페이' },
  { value: 'naver_pay', label: '네이버페이' },
]
