/** 주문(결제) 페이지 — 배송·결제 입력 후 서버 orders 스키마에 맞춰 주문 생성 */
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Footer from '@/components/Footer'
import { cancelOrder, createOrder } from '@/api/orders'
import { updatePayment } from '@/api/payments'
import {
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  MEMBER_DISCOUNT,
} from '@/constants/cart'
import { PAYMENT_METHOD_OPTIONS } from '@/constants/order'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatWon } from '@/utils/formatPrice'
import { fetchPortoneConfig } from '@/api/config'
import {
  applyPortOneChannelOrPg,
  getPortOneImpCode,
  getPortOnePaymentParams,
  setPortOneImpCodeFromServer,
} from '@/config/portone'
import '@/styles/orderCheckout.css'

// 포트원(아임포트) 결제 모듈 스크립트 URL
const PORTONE_SCRIPT_SRC = 'https://cdn.iamport.kr/v1/iamport.js'

/** 재고 기준 구매 가능 여부 (장바구니와 동일) */
const isItemPurchasable = (item) => {
  const stock = item.product?.stock
  if (typeof stock === 'number' && stock === 0) return false
  if (typeof stock === 'number' && item.quantity > stock) return false
  return true
}

const getOptionLabel = (item) => {
  const parts = [item.color, item.size].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : '단일 옵션'
}

function OrderCheckout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { shouldRedirectToLogin, isLoading: authLoading } = useRequireAuth()
  const { items, isLoading, error, fetchCart } = useCart()

  const cartItemIdsFromNav = location.state?.cartItemIds

  const [receiverName, setReceiverName] = useState(() => user?.name?.trim() || '')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [deliveryRequest, setDeliveryRequest] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD_OPTIONS[0]?.value || 'card')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPortOneReady, setIsPortOneReady] = useState(false)

  /** 로그인 직후 수령인 기본값을 회원 이름으로 채움 */
  useEffect(() => {
    if (user?.name) {
      setReceiverName((prev) => (prev.trim() ? prev : String(user.name).trim()))
    }
  }, [user])

  /**
   * 포트원(아임포트) 결제 모듈 초기화
   * - 스크립트를 동적으로 로드하고, 로드 완료 후 IMP.init(고객사 식별코드) 호출
   */
  useEffect(() => {
    let cancelled = false

    const initImpCode = async () => {
      if (import.meta.env.VITE_PORTONE_IMP_CODE?.trim()) {
        return getPortOneImpCode()
      }
      try {
        const res = await fetchPortoneConfig()
        if (res.success && res.data?.impCode) {
          setPortOneImpCodeFromServer(res.data.impCode)
        }
      } catch (_) {
        // 서버 설정 없으면 아래 getPortOneImpCode()에서 안내
      }
      return getPortOneImpCode()
    }

    const initPortOne = async () => {
      // 브라우저 환경에서만 동작 (테스트/SSR 방어)
      if (typeof window === 'undefined') return

      const impCode = await initImpCode()
      if (!impCode) {
        if (!cancelled) {
          setSubmitError(
            '포트원 고객사 식별코드가 없습니다. server/.env에 PORTONE_IMP_CODE를 REST API 키와 같은 콘솔의 imp 코드로 설정해 주세요.',
          )
        }
        return
      }

      const applyInit = () => {
        if (!window.IMP) return false
        window.IMP.init(impCode)
        return true
      }

      // 이미 로드되어 있으면 바로 초기화
      if (window.IMP) {
        applyInit()
        if (!cancelled) setIsPortOneReady(true)
        return
      }

      const existing = document.querySelector(`script[src="${PORTONE_SCRIPT_SRC}"]`)
      if (existing) {
        existing.addEventListener(
          'load',
          () => {
            if (applyInit() && !cancelled) setIsPortOneReady(true)
          },
          { once: true },
        )
        existing.addEventListener(
          'error',
          () => {
            if (!cancelled) setSubmitError('결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
          },
          { once: true },
        )
        return
      }

      const script = document.createElement('script')
      script.src = PORTONE_SCRIPT_SRC
      script.async = true

      script.onload = () => {
        if (!window.IMP) {
          if (!cancelled) setSubmitError('결제 모듈 초기화에 실패했습니다. 새로고침 후 다시 시도해 주세요.')
          return
        }
        if (applyInit() && !cancelled) setIsPortOneReady(true)
      }

      script.onerror = () => {
        if (!cancelled) setSubmitError('결제 모듈을 불러오지 못했습니다. 네트워크를 확인해 주세요.')
      }

      document.head.appendChild(script)
    }

    initPortOne()

    return () => {
      cancelled = true
    }
  }, [])

  /** 주문 대상 장바구니 줄 (내비게이션에 id 목록이 없으면 전체 줄·서버와 동일) */
  const orderLines = useMemo(() => {
    if (!items.length) return []
    if (cartItemIdsFromNav === undefined) {
      return items.filter(isItemPurchasable)
    }
    const idSet = new Set(cartItemIdsFromNav.map(String))
    return items.filter((item) => idSet.has(String(item._id)) && isItemPurchasable(item))
  }, [items, cartItemIdsFromNav])

  const subtotal = useMemo(
    () => orderLines.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderLines],
  )

  const shippingFee = useMemo(() => {
    if (orderLines.length === 0) return 0
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE
  }, [orderLines.length, subtotal])

  const memberDiscount = isAuthenticated && orderLines.length > 0 ? MEMBER_DISCOUNT : 0
  const totalPaymentAmount = Math.max(0, subtotal + shippingFee - memberDiscount)

  /** PortOne 결제창 호출을 Promise로 감싼다 */
  const requestPortOnePay = (params) =>
    new Promise((resolve, reject) => {
      if (!window.IMP) {
        reject(new Error('결제 모듈이 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.'))
        return
      }

      // PortOne SDK 콜백 기반 API를 Promise로 변환
      window.IMP.request_pay(params, (rsp) => {
        resolve(rsp)
      })
    })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (orderLines.length === 0) {
      setSubmitError('주문할 수 있는 상품이 없습니다.')
      return
    }

    if (!receiverName.trim() || !receiverPhone.trim() || !zipcode.trim() || !address1.trim()) {
      setSubmitError('수령인, 연락처, 우편번호, 기본 주소는 필수입니다.')
      return
    }

    if (!isPortOneReady) {
      setSubmitError('결제 모듈을 초기화하는 중입니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    /** 주문 생성 이후 단계에서만 채워짐 — 실패 페이지에 주문번호 안내용 */
    let pendingOrderMeta = null

    setIsSubmitting(true)
    try {
      const payload = {
        fromCart: true,
        cartItemIds:
          cartItemIdsFromNav === undefined ? [] : cartItemIdsFromNav.map((id) => String(id)),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        zipcode: zipcode.trim(),
        address1: address1.trim(),
        address2: address2.trim(),
        deliveryRequest: deliveryRequest.trim(),
        paymentMethod,
      }

      const res = await createOrder(payload)
      if (res.success && res.data) {
        // 주문 생성 시점에 서버가 결제(pending)를 함께 만들어준다.
        const orderId = res.data._id
        const orderNumber = res.data.orderNumber
        const amount = res.data.totalPaymentAmount
        const paymentId = res.data.payments?.[0]?._id

        if (!orderId || !orderNumber || !paymentId) {
          throw new Error('주문/결제 정보가 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.')
        }

        pendingOrderMeta = { orderNumber, orderId, paymentId }

        // 결제 상품명(대표 1개 + 외 n개)
        const firstName = orderLines[0]?.name || '주문 상품'
        const extraCount = Math.max(0, orderLines.length - 1)
        const orderName = extraCount > 0 ? `${firstName} 외 ${extraCount}개` : firstName

        const { pg, pay_method } = getPortOnePaymentParams(paymentMethod)

        // 1) 결제창 호출 — channelKey가 있으면 pg 대신 채널로 연결(포트원 콘솔 설정과 일치해야 함)
        const payParams = applyPortOneChannelOrPg({
          pg,
          pay_method,
          merchant_uid: orderNumber, // 주문번호를 merchant_uid로 사용
          name: orderName,
          amount,
          buyer_name: receiverName.trim(),
          buyer_tel: receiverPhone.trim(),
          buyer_email: user?.email?.trim() || undefined,
          buyer_addr: `${address1.trim()} ${address2.trim()}`.trim(),
          buyer_postcode: zipcode.trim(),
        })
        const rsp = await requestPortOnePay(payParams)

        // 2) 결제 결과 서버 반영
        if (rsp?.success) {
          try {
            await updatePayment(orderId, paymentId, {
              paymentStatus: 'completed',
              pgProvider: rsp.pg_provider || pg,
              pgTransactionId: rsp.imp_uid || rsp.pg_tid || '',
            })

            await fetchCart()

            const paymentMethodLabel =
              PAYMENT_METHOD_OPTIONS.find((o) => o.value === paymentMethod)?.label || paymentMethod

            navigate('/checkout/success', {
              replace: true,
              state: {
                orderNumber,
                totalPaymentAmount: amount,
                receiverName: receiverName.trim(),
                receiverPhone: receiverPhone.trim(),
                zipcode: zipcode.trim(),
                address1: address1.trim(),
                address2: address2.trim(),
                deliveryRequest: deliveryRequest.trim(),
                paymentMethodLabel,
                items: orderLines.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  option: getOptionLabel(item),
                  lineTotal: item.price * item.quantity,
                })),
              },
            })
          } catch (syncErr) {
            navigate('/checkout/failure', {
              replace: true,
              state: {
                message:
                  syncErr.message ||
                  '결제는 완료되었으나 서버에 결과를 저장하지 못했습니다. 고객센터로 문의해 주세요.',
                orderNumber,
              },
            })
          }
        } else {
          try {
            await updatePayment(orderId, paymentId, {
              paymentStatus: rsp?.error_msg ? 'failed' : 'cancelled',
              pgProvider: rsp?.pg_provider || pg,
              pgTransactionId: rsp?.imp_uid || rsp?.pg_tid || '',
              failedReason: rsp?.error_msg || '결제가 취소되었습니다.',
            })
          } catch (_) {
            // 서버 반영 실패해도 실패 화면은 동일하게 보여 준다.
          }

          // 결제 실패·취소 시 미결제 주문을 취소해야 새 주문(재결제)이 가능하다.
          try {
            await cancelOrder(orderId)
          } catch (_) {
            // 취소 실패 시 실패 페이지에서 수동 취소
          }

          await fetchCart()

          navigate('/checkout/failure', {
            replace: true,
            state: {
              message: rsp?.error_msg || '결제가 완료되지 않았습니다.',
              orderNumber,
              orderId,
              hint:
                '미결제 주문은 자동으로 취소되었습니다. 장바구니 상품은 그대로 남아 있으니 다시 주문해 주세요.',
            },
          })
        }
      } else {
        navigate('/checkout/failure', {
          replace: true,
          state: {
            message: res.message || '주문 처리에 실패했습니다.',
          },
        })
      }
    } catch (err) {
      navigate('/checkout/failure', {
        replace: true,
        state: {
          message: err.message || '주문 처리에 실패했습니다.',
          orderNumber: pendingOrderMeta?.orderNumber,
          orderId: pendingOrderMeta?.orderId,
          isPendingOrderConflict: String(err.message || '').includes('결제 대기'),
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return null
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  }

  return (
    <div className="order-page">
      <div className="order">
        <nav className="order__nav" aria-label="주문 단계 탐색">
          <Link to="/cart" className="order__back">
            ← 장바구니로 돌아가기
          </Link>
        </nav>

        <h1 className="order__title">주문 / 결제</h1>
        <p className="order__lead">
          배송지 정보는 주문 시점에 저장되며, 이후 회원 정보가 바뀌어도 이 주문에는 반영되지 않습니다.
        </p>

        {isLoading && <p className="order__state">장바구니를 불러오는 중…</p>}

        {error && !isLoading && (
          <p className="order__error" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="order__state">
            <p>장바구니가 비어 있습니다.</p>
            <Link to="/" className="order__back">
              쇼핑하러 가기
            </Link>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && orderLines.length === 0 && (
          <div className="order__state">
            <p>선택한 상품을 주문할 수 없습니다. 재고를 확인하거나 장바구니에서 다시 선택해 주세요.</p>
            <Link to="/cart" className="order__back">
              장바구니로 이동
            </Link>
          </div>
        )}

        {!isLoading && !error && orderLines.length > 0 && (
          <form onSubmit={handleSubmit} noValidate>
            <section className="order__section" aria-labelledby="order-products-heading">
              <h2 id="order-products-heading" className="order__section-title">
                주문 상품
              </h2>
              <div className="order__table-wrap">
                <table className="order__table">
                  <thead>
                    <tr>
                      <th scope="col">상품</th>
                      <th scope="col" className="order__col-qty">
                        수량
                      </th>
                      <th scope="col" className="order__col-amt">
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLines.map((item) => {
                      const lineTotal = item.price * item.quantity
                      return (
                        <tr key={item._id}>
                          <td>
                            <strong>{item.name}</strong>
                            <span className="order__option">{getOptionLabel(item)}</span>
                          </td>
                          <td className="order__col-qty">{item.quantity}</td>
                          <td className="order__col-amt">{formatWon(lineTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="order__summary">
                <div className="order__summary-row">
                  <span>상품 총액</span>
                  <span className="order__summary-value">{formatWon(subtotal)}</span>
                </div>
                <div className="order__summary-row">
                  <span>배송비</span>
                  <span className="order__summary-value">{formatWon(shippingFee)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="order__summary-row order__summary-row--discount">
                    <span>할인 금액</span>
                    <span className="order__summary-value">-{formatWon(memberDiscount)}</span>
                  </div>
                )}
                <div className="order__summary-row order__summary-row--total">
                  <span>최종 결제 금액</span>
                  <span className="order__summary-value">{formatWon(totalPaymentAmount)}</span>
                </div>
              </div>
              <p className="order__hint">
                최종 금액은 서버에서 같은 배송비·할인 정책으로 다시 계산됩니다.
              </p>
            </section>

            <section className="order__section" aria-labelledby="order-ship-heading">
              <h2 id="order-ship-heading" className="order__section-title">
                배송지 (주문 시 스냅샷)
              </h2>
              <div className="order__fieldset">
                <div className="order__grid-2">
                  <div>
                    <label htmlFor="receiverName" className="order__label">
                      수령인 <span className="order__req">*</span>
                    </label>
                    <input
                      id="receiverName"
                      className="order__input"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="receiverPhone" className="order__label">
                      수령인 연락처 <span className="order__req">*</span>
                    </label>
                    <input
                      id="receiverPhone"
                      className="order__input"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="zipcode" className="order__label">
                    우편번호 <span className="order__req">*</span>
                  </label>
                  <input
                    id="zipcode"
                    className="order__input"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address1" className="order__label">
                    기본 주소 <span className="order__req">*</span>
                  </label>
                  <input
                    id="address1"
                    className="order__input"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    autoComplete="address-line1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address2" className="order__label">
                    상세 주소 <span className="order__req">*</span>
                  </label>
                  <input
                    id="address2"
                    className="order__input"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    autoComplete="address-line2"
                  />
                  <p className="order__hint">없으면 &quot;없음&quot; 등으로 입력해 주세요.</p>
                </div>
                <div>
                  <label htmlFor="deliveryRequest" className="order__label">
                    배송 요청사항 <span className="order__label-opt">(선택)</span>
                  </label>
                  <textarea
                    id="deliveryRequest"
                    className="order__input order__textarea"
                    value={deliveryRequest}
                    onChange={(e) => setDeliveryRequest(e.target.value)}
                    rows={3}
                    placeholder="예: 부재 시 문 앞에 놓아 주세요"
                  />
                </div>
              </div>
            </section>

            <section className="order__section" aria-labelledby="order-pay-heading">
              <h2 id="order-pay-heading" className="order__section-title">
                결제
              </h2>
              <div>
                <label htmlFor="paymentMethod" className="order__label">
                  결제 수단 <span className="order__req">*</span>
                </label>
                <select
                  id="paymentMethod"
                  className="order__input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="order__hint">
                  결제 건은 주문과 분리되어 저장되며, PG 연동 시 거래번호·상태가 갱신됩니다.
                </p>
              </div>
            </section>

            {submitError && (
              <p className="order__error" role="alert">
                {submitError}
              </p>
            )}

            <div className="order__actions">
              <button type="submit" className="order__submit" disabled={isSubmitting || !isPortOneReady}>
                {isSubmitting ? '주문 접수 중…' : `${formatWon(totalPaymentAmount)} 주문하기`}
              </button>
              {!isPortOneReady && (
                <p className="order__hint">결제 모듈을 초기화하는 중입니다. 잠시만 기다려 주세요.</p>
              )}
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default OrderCheckout
