/**
 * 주문(결제) 실패 페이지 — 주문 생성·결제 단계 오류 시 안내 및 미결제 주문 취소
 */
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import { cancelOrder, fetchOrders } from '@/api/orders'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import '@/styles/orderCheckout.css'

function OrderFailure() {
  const location = useLocation()
  const { shouldRedirectToLogin, isLoading: authLoading } = useRequireAuth()

  const payload = location.state
  const [pendingOrderId, setPendingOrderId] = useState(payload?.orderId || null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelDone, setCancelDone] = useState(false)

  /** 결제 대기 주문 충돌인데 orderId가 없으면 목록에서 미결제 주문을 찾는다 */
  useEffect(() => {
    if (pendingOrderId || !payload?.isPendingOrderConflict) return

    let cancelled = false
    const loadPending = async () => {
      try {
        const res = await fetchOrders()
        const pending = (res.data || []).find((o) => o.orderStatus === 'pending_payment')
        if (!cancelled && pending?._id) setPendingOrderId(pending._id)
      } catch (_) {
        // 수동 안내만 표시
      }
    }
    loadPending()
    return () => {
      cancelled = true
    }
  }, [pendingOrderId, payload?.isPendingOrderConflict])

  if (authLoading) {
    return null
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: '/checkout/failure' }} />
  }

  if (!payload?.message) {
    return <Navigate to="/cart" replace />
  }

  const { message, orderNumber, hint } = payload

  const handleCancelPendingOrder = async () => {
    if (!pendingOrderId) return
    setIsCancelling(true)
    setCancelError('')
    try {
      const res = await cancelOrder(pendingOrderId)
      if (res.success) {
        setCancelDone(true)
        setPendingOrderId(null)
      } else {
        setCancelError(res.message || '주문 취소에 실패했습니다.')
      }
    } catch (err) {
      setCancelError(err.message || '주문 취소에 실패했습니다.')
    } finally {
      setIsCancelling(false)
    }
  }

  const showPendingBlock =
    payload.isPendingOrderConflict || (pendingOrderId && !cancelDone)

  return (
    <div className="order-page">
      <div className="order">
        <div className="order-failure-page">
          <p className="order-failure-page__headline" role="alert">
            주문에 실패했습니다
          </p>
          <p className="order-failure-page__detail">{message}</p>

          {orderNumber ? (
            <p className="order-failure-page__meta">
              관련 주문번호: <strong>{orderNumber}</strong>
            </p>
          ) : null}

          {showPendingBlock && (
            <div className="order-failure-page__pending-box">
              <p>
                이전에 만들어진 <strong>결제 대기</strong> 주문이 남아 있으면 새로 결제할 수
                없습니다. 아래에서 미결제 주문을 취소한 뒤 다시 시도해 주세요.
              </p>
              {pendingOrderId ? (
                <button
                  type="button"
                  className="order-failure-page__btn order-failure-page__btn--primary"
                  disabled={isCancelling}
                  onClick={handleCancelPendingOrder}
                >
                  {isCancelling ? '취소 처리 중…' : '미결제 주문 취소하기'}
                </button>
              ) : (
                <p className="order-failure-page__hint">미결제 주문 정보를 불러오는 중…</p>
              )}
              {cancelError && (
                <p className="order-failure-page__error" role="alert">
                  {cancelError}
                </p>
              )}
            </div>
          )}

          {cancelDone && (
            <p className="order-failure-page__success" role="status">
              미결제 주문이 취소되었습니다. 이제 다시 주문할 수 있습니다.
            </p>
          )}

          {hint ? <p className="order-failure-page__hint">{hint}</p> : null}

          <div className="order-failure-page__actions">
            <Link to="/checkout" className="order-failure-page__btn order-failure-page__btn--primary">
              주문서 다시 시도
            </Link>
            <Link to="/cart" className="order-failure-page__btn">
              장바구니로
            </Link>
            <Link to="/orders" className="order-failure-page__btn order-failure-page__btn--ghost">
              내 주문목록
            </Link>
            <Link to="/" className="order-failure-page__btn order-failure-page__btn--ghost">
              홈으로
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderFailure
