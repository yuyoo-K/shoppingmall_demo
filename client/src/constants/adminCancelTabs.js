/**
 * 관리자 취소관리 탭 — 취소된 주문(orderStatus: cancelled) 분류
 */

/** 취소 주문만 대상으로 탭 필터 적용 */
export const filterCancelledOrder = (order) => order.orderStatus === 'cancelled'

export const ADMIN_CANCEL_TABS = [
  {
    id: 'all',
    label: '전체',
    match: () => true,
  },
  {
    id: 'before_pay',
    label: '결제 전 취소',
    /** 결제 완료 전에 취소된 주문 */
    match: (order) => !order.paidAt,
  },
  {
    id: 'after_pay',
    label: '결제 후 취소',
    /** 입금·결제 완료 후 취소된 주문 */
    match: (order) => Boolean(order.paidAt),
  },
]
