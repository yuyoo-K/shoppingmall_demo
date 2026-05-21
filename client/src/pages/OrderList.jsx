/**
 * 내 주문 목록 페이지 — 주문별 상품을 테이블 행으로 표시 (ORDERED 레이아웃)
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Footer from '@/components/Footer'
import { fetchOrders } from '@/api/orders'
import { ORDER_LIST_TABS } from '@/constants/orderListTabs'
import {
  CANCELLABLE_ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  SHIPPING_STATUS_LABEL,
  TRACKING_ORDER_STATUSES,
} from '@/constants/orderStatusLabels'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import {
  formatOrderListDate,
  formatOrderListId,
  formatOrderListPrice,
  formatTrackingLine,
} from '@/utils/formatOrderDisplay'
import '@/styles/orderList.css'

/** API 주문 배열 → 테이블 행(상품 1개 = 1행) */
const flattenOrderRows = (orders) => {
  const rows = []
  for (const order of orders) {
    const items = order.items?.length ? order.items : []
    if (items.length === 0) {
      rows.push({ order, item: null })
      continue
    }
    for (const item of items) {
      rows.push({ order, item })
    }
  }
  return rows
}

function OrderList() {
  const { shouldRedirectToLogin, isLoading: authLoading } = useRequireAuth()
  const [orders, setOrders] = useState([])
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  /** 목록 탭 — 기본: 상품준비중 */
  const [activeTab, setActiveTab] = useState(ORDER_LIST_TABS[0].id)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const res = await fetchOrders()
        if (!cancelled) {
          setOrders(res.success ? res.data || [] : [])
          if (!res.success) setLoadError(res.message || '주문 목록을 불러오지 못했습니다.')
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || '주문 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    if (!authLoading && !shouldRedirectToLogin) {
      load()
    }

    return () => {
      cancelled = true
    }
  }, [authLoading, shouldRedirectToLogin])

  const activeTabDef = ORDER_LIST_TABS.find((t) => t.id === activeTab) || ORDER_LIST_TABS[0]

  /** 선택 탭의 orderStatus에 맞는 주문만 표시 */
  const filteredOrders = useMemo(
    () => orders.filter((o) => activeTabDef.statuses.includes(o.orderStatus)),
    [orders, activeTabDef],
  )

  const tableRows = useMemo(() => flattenOrderRows(filteredOrders), [filteredOrders])

  /** 탭별 주문 건수(주문 단위, 상품 행 수 아님) */
  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of ORDER_LIST_TABS) {
      counts[tab.id] = orders.filter((o) => tab.statuses.includes(o.orderStatus)).length
    }
    return counts
  }, [orders])

  if (authLoading) {
    return null
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: '/orders' }} />
  }

  return (
    <div className="order-list-page">
      <div className="order-list">
        <h1 className="order-list__title">ORDERED</h1>

        <nav className="order-list__tabs" aria-label="주문 상태별 보기">
          {ORDER_LIST_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = tabCounts[tab.id] ?? 0
            return (
              <button
                key={tab.id}
                type="button"
                className={`order-list__tab${isActive ? ' order-list__tab--active' : ''}`}
                aria-selected={isActive}
                aria-controls="order-list-panel"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="order-list__tab-count">{count}</span>
              </button>
            )
          })}
        </nav>

        <div
          id="order-list-panel"
          className="order-list__table"
          role="table"
          aria-label={`${activeTabDef.label} 주문 목록`}
        >
          <div className="order-list__head" role="row">
            <span className="order-list__col order-list__col--no" role="columnheader">
              주문번호
            </span>
            <span className="order-list__col order-list__col--img" role="columnheader">
              IMAGE
            </span>
            <span className="order-list__col order-list__col--item" role="columnheader">
              ITEM
            </span>
            <span className="order-list__col order-list__col--price" role="columnheader">
              PRICE
            </span>
            <span className="order-list__col order-list__col--qty" role="columnheader">
              수량
            </span>
            <span className="order-list__col order-list__col--order" role="columnheader">
              주문상태
            </span>
            <span className="order-list__col order-list__col--ship" role="columnheader">
              배송상태
            </span>
          </div>

          {isLoading && <p className="order-list__state">주문 목록을 불러오는 중…</p>}

          {loadError && !isLoading && (
            <p className="order-list__error" role="alert">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && tableRows.length === 0 && (
            <p className="order-list__state">
              {orders.length === 0
                ? '주문 내역이 없습니다.'
                : `${activeTabDef.label} 상태의 주문이 없습니다.`}
            </p>
          )}

          {!isLoading &&
            !loadError &&
            tableRows.map(({ order, item }, idx) => {
              const orderStatus = order.orderStatus
              const orderLabel = ORDER_STATUS_LABEL[orderStatus] || orderStatus
              const shipLabel = SHIPPING_STATUS_LABEL[orderStatus] || '—'
              const showCancel = CANCELLABLE_ORDER_STATUSES.includes(orderStatus)
              const showTracking = TRACKING_ORDER_STATUSES.includes(orderStatus)
              const showReviews = orderStatus === 'delivered'

              return (
                <div
                  key={`${order._id}-${item?._id || 'empty'}-${idx}`}
                  className="order-list__row"
                  role="row"
                >
                  <div className="order-list__col order-list__col--no" role="cell">
                    <span className="order-list__date">{formatOrderListDate(order.orderedAt)}</span>
                    <span className="order-list__id">{formatOrderListId(order.orderNumber)}</span>
                  </div>

                  <div className="order-list__col order-list__col--img" role="cell">
                    {item?.productImage ? (
                      <img
                        src={item.productImage}
                        alt=""
                        className="order-list__thumb"
                        width={56}
                        height={56}
                      />
                    ) : (
                      <span className="order-list__thumb order-list__thumb--empty" aria-hidden />
                    )}
                  </div>

                  <div className="order-list__col order-list__col--item" role="cell">
                    <span className="order-list__item-name">
                      {item?.productName || '—'}
                    </span>
                  </div>

                  <div className="order-list__col order-list__col--price" role="cell">
                    {item ? formatOrderListPrice(item.unitPrice) : '—'}
                  </div>

                  <div className="order-list__col order-list__col--qty" role="cell">
                    {item?.quantity ?? '—'}
                  </div>

                  <div className="order-list__col order-list__col--order" role="cell">
                    <span className="order-list__status-main">{orderLabel}</span>
                    {showCancel && (
                      <button type="button" className="order-list__cancel-link">
                        취소신청
                      </button>
                    )}
                  </div>

                  <div className="order-list__col order-list__col--ship" role="cell">
                    <span
                      className={
                        shipLabel === '배송중' || shipLabel === '배송시작'
                          ? 'order-list__ship-status order-list__ship-status--active'
                          : 'order-list__ship-status'
                      }
                    >
                      {shipLabel}
                    </span>
                    {showTracking && (
                      <span className="order-list__tracking">
                        {formatTrackingLine(order.orderNumber)}
                      </span>
                    )}
                    {showReviews && (
                      <button type="button" className="order-list__reviews-btn">
                        REVIEWS
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        <p className="order-list__footer-label">주문목록</p>

        <div className="order-list__nav">
          <Link to="/" className="order-list__nav-link">
            홈으로
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderList
