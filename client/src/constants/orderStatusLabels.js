/**
 * 주문·배송 상태 한국어 라벨 (목록 UI용)
 */

/** orders.orderStatus → 주문상태 열 표시 */
export const ORDER_STATUS_LABEL = {
  pending_payment: '결제대기',
  paid: '입금완료',
  preparing: '입금완료',
  shipping_start: '입금완료',
  shipping: '입금완료',
  delivered: '입금완료',
  cancelled: '주문취소',
}

/** orders.orderStatus → 배송상태 열 표시 */
export const SHIPPING_STATUS_LABEL = {
  pending_payment: '—',
  paid: '상품준비중',
  preparing: '상품준비중',
  shipping_start: '배송시작',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '—',
}

/** 취소 신청 버튼 노출 가능한 주문 상태 */
export const CANCELLABLE_ORDER_STATUSES = ['paid', 'preparing', 'shipping_start']

/** 리뷰 버튼·배송 추적 문구 노출 */
export const TRACKING_ORDER_STATUSES = ['shipping_start', 'shipping', 'delivered']

/** 관리자 주문관리 — 상태 선택 목록 (orders.orderStatus, 서버 enum과 동일) */
export const ADMIN_ORDER_STATUS_OPTIONS = [
  { value: 'pending_payment', label: '결제대기' },
  { value: 'paid', label: '입금완료' },
  { value: 'preparing', label: '상품준비중' },
  { value: 'shipping_start', label: '배송시작' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '주문취소' },
]

/** order_items.itemStatus → 취소관리 상품상태 열 */
export const ORDER_ITEM_STATUS_LABEL = {
  pending: '대기',
  paid: '결제완료',
  preparing: '준비중',
  shipping_start: '배송시작',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨',
  refunded: '환불완료',
}
