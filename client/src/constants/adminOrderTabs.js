/**
 * 관리자 주문관리 탭 — 전체·결제대기 포함 (orders.orderStatus 기준)
 */
import { ORDER_LIST_TABS } from '@/constants/orderListTabs'

export const ADMIN_ORDER_LIST_TABS = [
  { id: 'all', label: '전체', statuses: null },
  { id: 'pending', label: '결제대기', statuses: ['pending_payment'] },
  ...ORDER_LIST_TABS,
]
