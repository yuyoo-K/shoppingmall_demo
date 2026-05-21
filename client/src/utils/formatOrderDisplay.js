/**
 * 주문 목록 UI용 날짜·번호·가격 포맷
 */

/** orderedAt → "2021. 12. 6." 형식 */
export const formatOrderListDate = (orderedAt) => {
  const d = new Date(orderedAt)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

/** 주문번호에서 목록용 짧은 ID (ORD-20250520-ABC123 → ABC123) */
export const formatOrderListId = (orderNumber) => {
  if (!orderNumber) return '—'
  const parts = String(orderNumber).split('-')
  return parts.length > 1 ? parts[parts.length - 1] : orderNumber
}

/** 이미지 스타일 가격 "₩ 29,000" */
export const formatOrderListPrice = (price) =>
  `₩ ${Number(price).toLocaleString('ko-KR')}`

/** 배송 추적 데모 문구 (스키마에 송장 필드 없음) */
export const formatTrackingLine = (orderNumber) => {
  const tail = String(orderNumber || '').replace(/\D/g, '').slice(-9) || '000000000'
  return `대한통운, ${tail}`
}
