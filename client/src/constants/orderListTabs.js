/**
 * 주문 목록 상단 탭 — orders.orderStatus 기준 분류
 * (server/src/constants/order.js · Order 스키마와 동일한 값 사용)
 */

export const ORDER_LIST_TABS = [
  {
    id: 'preparing',
    label: '상품준비중',
    statuses: ['paid', 'preparing'],
  },
  {
    id: 'shipping_start',
    label: '배송시작',
    statuses: ['shipping_start'],
  },
  {
    id: 'shipping',
    label: '배송중',
    statuses: ['shipping'],
  },
  {
    id: 'delivered',
    label: '배송완료',
    statuses: ['delivered'],
  },
  {
    id: 'cancelled',
    label: '주문취소',
    statuses: ['cancelled'],
  },
]

/** 탭 id로 orderStatus 포함 여부 */
export const orderMatchesTab = (orderStatus, tabId) => {
  const tab = ORDER_LIST_TABS.find((t) => t.id === tabId)
  if (!tab) return false
  return tab.statuses.includes(orderStatus)
}
