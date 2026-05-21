/**
 * 결제 API (주문 하위 리소스)
 */
import api from '@/api/axios'

/** 주문별 결제 목록 */
export const fetchOrderPayments = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}/payments`)
  return data
}

/**
 * 결제 상태 갱신
 * - 결제창 결과(성공/실패/취소)를 서버 payments에 반영한다.
 */
export const updatePayment = async (orderId, paymentId, payload) => {
  const { data } = await api.put(`/orders/${orderId}/payments/${paymentId}`, payload)
  return data
}

/** 결제 취소 (pending·failed 등 미완료 건) */
export const cancelPayment = async (orderId, paymentId) => {
  const { data } = await api.delete(`/orders/${orderId}/payments/${paymentId}`)
  return data
}

