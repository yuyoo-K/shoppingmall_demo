/**
 * 주문(결제) 완료 페이지 — 결제 성공 후 주문번호·배송지 등 요약 표시
 */
import { Link, Navigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatWon } from '@/utils/formatPrice'
import '@/styles/orderCheckout.css'

function OrderSuccess() {
  const location = useLocation()
  const { shouldRedirectToLogin, isLoading: authLoading } = useRequireAuth()

  const payload = location.state

  if (authLoading) {
    return null
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: '/checkout/success' }} />
  }

  /** 직접 URL 접근 등으로 state가 없으면 홈으로 보낸다 */
  if (!payload?.orderNumber) {
    return <Navigate to="/" replace />
  }

  const {
    orderNumber,
    totalPaymentAmount,
    receiverName,
    receiverPhone,
    zipcode,
    address1,
    address2,
    deliveryRequest,
    paymentMethodLabel,
    items = [],
  } = payload

  const fullAddress = [zipcode, address1, address2].filter(Boolean).join(' ')

  return (
    <div className="order-page">
      <div className="order">
        <div className="order-success-page">
          <p className="order-success-page__headline" role="status">
            주문이 성공적으로 완료되었습니다
          </p>

          <section className="order-success-page__section" aria-labelledby="order-success-summary">
            <h2 id="order-success-summary" className="order-success-page__section-title">
              주문 정보
            </h2>
            <dl className="order-success-page__dl">
              <div className="order-success-page__row">
                <dt>주문번호</dt>
                <dd>{orderNumber}</dd>
              </div>
              <div className="order-success-page__row">
                <dt>결제 금액</dt>
                <dd className="order-success-page__amount">{formatWon(totalPaymentAmount)}</dd>
              </div>
              <div className="order-success-page__row">
                <dt>결제 수단</dt>
                <dd>{paymentMethodLabel || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="order-success-page__section" aria-labelledby="order-success-ship">
            <h2 id="order-success-ship" className="order-success-page__section-title">
              배송 정보
            </h2>
            <dl className="order-success-page__dl">
              <div className="order-success-page__row">
                <dt>수령인</dt>
                <dd>{receiverName}</dd>
              </div>
              <div className="order-success-page__row">
                <dt>연락처</dt>
                <dd>{receiverPhone}</dd>
              </div>
              <div className="order-success-page__row">
                <dt>배송지</dt>
                <dd>{fullAddress || '—'}</dd>
              </div>
              {deliveryRequest ? (
                <div className="order-success-page__row">
                  <dt>배송 요청</dt>
                  <dd>{deliveryRequest}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {items.length > 0 && (
            <section className="order-success-page__section" aria-labelledby="order-success-items">
              <h2 id="order-success-items" className="order-success-page__section-title">
                주문 상품
              </h2>
              <ul className="order-success-page__items">
                {items.map((row, idx) => (
                  <li key={`${row.name}-${idx}`} className="order-success-page__item">
                    <div>
                      <strong>{row.name}</strong>
                      {row.option ? (
                        <span className="order-success-page__item-option">{row.option}</span>
                      ) : null}
                    </div>
                    <div className="order-success-page__item-meta">
                      수량 {row.quantity} · {formatWon(row.lineTotal)}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="order__success-actions">
            <Link to="/orders" className="order__link-btn order__link-btn--primary">
              주문목록 보기
            </Link>
            <Link to="/" className="order__link-btn">
              홈으로
            </Link>
            <Link to="/cart" className="order__link-btn">
              장바구니
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderSuccess
