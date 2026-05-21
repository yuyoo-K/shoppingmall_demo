/**
 * 주문 API
 */
import api from '@/api/axios'

/**
 * 장바구니 기반 주문 생성
 * @param {Record<string, unknown>} payload 서버 orderController.createOrder body
 */
export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload)
  return data
}

/** 주문 목록 (상품·이미지 포함, 관리자는 전체 주문) */
export const fetchOrders = async () => {
  const { data } = await api.get('/orders')
  return data
}

/** 주문 수정 (관리자: orderStatus 등) */
export const updateOrder = async (orderId, payload) => {
  const { data } = await api.put(`/orders/${orderId}`, payload)
  return data
}

/** 주문 취소 */
export const cancelOrder = async (orderId) => {
  const { data } = await api.delete(`/orders/${orderId}`)
  return data
}
