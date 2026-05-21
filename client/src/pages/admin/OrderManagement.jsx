/**
 * 관리자 주문관리 — 전체 주문 목록·상태 탭·배송시작/배송중/완료·주문취소 API 연동
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchOrders, updateOrder } from '@/api/orders'
import { ADMIN_ORDER_LIST_TABS } from '@/constants/adminOrderTabs'
import {
  ADMIN_ORDER_STATUS_OPTIONS,
  ORDER_STATUS_LABEL,
  SHIPPING_STATUS_LABEL,
  TRACKING_ORDER_STATUSES,
} from '@/constants/orderStatusLabels'
import {
  formatOrderListDate,
  formatOrderListId,
  formatOrderListPrice,
  formatTrackingLine,
} from '@/utils/formatOrderDisplay'
import '@/styles/orderList.css'

/** 주문별 상품을 테이블 행으로 펼침 */
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

function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(ADMIN_ORDER_LIST_TABS[0].id)
  const [busyOrderId, setBusyOrderId] = useState(null)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const res = await fetchOrders()
      if (res.success) {
        setOrders(res.data || [])
      } else {
        setLoadError(res.message || '주문 목록을 불러오지 못했습니다.')
      }
    } catch (err) {
      setLoadError(err.message || '주문 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const activeTabDef =
    ADMIN_ORDER_LIST_TABS.find((t) => t.id === activeTab) || ADMIN_ORDER_LIST_TABS[0]

  const filteredOrders = useMemo(() => {
    if (!activeTabDef.statuses) return orders
    return orders.filter((o) => activeTabDef.statuses.includes(o.orderStatus))
  }, [orders, activeTabDef])

  const tableRows = useMemo(() => flattenOrderRows(filteredOrders), [filteredOrders])

  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of ADMIN_ORDER_LIST_TABS) {
      counts[tab.id] = tab.statuses
        ? orders.filter((o) => tab.statuses.includes(o.orderStatus)).length
        : orders.length
    }
    return counts
  }, [orders])

  /** 주문 상태 변경 — 단계 제한 없이 선택한 상태로 PUT /orders/:id */
  const handleStatusChange = async (orderId, nextStatus, currentStatus, orderNumber) => {
    if (nextStatus === currentStatus) return

    if (nextStatus === 'cancelled') {
      const ok = window.confirm(`주문 ${orderNumber}을(를) 취소 상태로 변경하시겠습니까?`)
      if (!ok) return
    }

    setBusyOrderId(orderId)
    setActionError('')
    try {
      const res = await updateOrder(orderId, { orderStatus: nextStatus })
      if (res.success) {
        await loadOrders()
      } else {
        setActionError(res.message || '주문 상태 변경에 실패했습니다.')
      }
    } catch (err) {
      setActionError(err.message || '주문 상태 변경에 실패했습니다.')
    } finally {
      setBusyOrderId(null)
    }
  }

  return (
    <div className="admin-main admin-main--orders">
      <header className="admin-main__header">
        <h1 className="admin-main__title">주문관리</h1>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn admin-btn--outline" onClick={loadOrders}>
            새로고침
          </button>
        </div>
      </header>

      <div className="order-list-page order-list-page--admin">
        <div className="order-list">
          <h2 className="order-list__title">ORDERED</h2>

          <nav className="order-list__tabs" aria-label="주문 상태별 보기">
            {ADMIN_ORDER_LIST_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const count = tabCounts[tab.id] ?? 0
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`order-list__tab${isActive ? ' order-list__tab--active' : ''}`}
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="order-list__tab-count">{count}</span>
                </button>
              )
            })}
          </nav>

          {(loadError || actionError) && (
            <p className="order-list__error admin-order-list__error" role="alert">
              {actionError || loadError}
            </p>
          )}

          <div
            className="order-list__table order-list__table--admin"
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
              <span className="order-list__col order-list__col--receiver" role="columnheader">
                수령인
              </span>
              <span className="order-list__col order-list__col--order" role="columnheader">
                주문상태
              </span>
              <span className="order-list__col order-list__col--ship" role="columnheader">
                배송상태
              </span>
              <span className="order-list__col order-list__col--actions" role="columnheader">
                관리
              </span>
            </div>

            {isLoading && <p className="order-list__state">주문 목록을 불러오는 중…</p>}

            {!isLoading && !loadError && tableRows.length === 0 && (
              <p className="order-list__state">
                {orders.length === 0
                  ? '등록된 주문이 없습니다.'
                  : `${activeTabDef.label} 상태의 주문이 없습니다.`}
              </p>
            )}

            {!isLoading &&
              !loadError &&
              tableRows.map(({ order, item }, idx) => {
                const prevOrderId = idx > 0 ? String(tableRows[idx - 1].order._id) : null
                const isPrimaryRow = prevOrderId !== String(order._id)

                const orderStatus = order.orderStatus
                const orderLabel = ORDER_STATUS_LABEL[orderStatus] || orderStatus
                const shipLabel = SHIPPING_STATUS_LABEL[orderStatus] || '—'
                const showTracking = TRACKING_ORDER_STATUSES.includes(orderStatus)
                const isBusy = busyOrderId === order._id
                const memberName = order.user?.name || '—'

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
                      <span className="order-list__item-name">{item?.productName || '—'}</span>
                    </div>

                    <div className="order-list__col order-list__col--price" role="cell">
                      {item ? formatOrderListPrice(item.unitPrice) : '—'}
                    </div>

                    <div className="order-list__col order-list__col--qty" role="cell">
                      {item?.quantity ?? '—'}
                    </div>

                    <div className="order-list__col order-list__col--receiver" role="cell">
                      <span className="order-list__receiver-name">{order.receiverName}</span>
                      <span className="order-list__receiver-meta">{memberName}</span>
                    </div>

                    <div className="order-list__col order-list__col--order" role="cell">
                      <span className="order-list__status-main">{orderLabel}</span>
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
                    </div>

                    <div className="order-list__col order-list__col--actions" role="cell">
                      {isPrimaryRow ? (
                        <label className="admin-order-list__status-field">
                          <span className="admin-order-list__status-label">상태 변경</span>
                          <select
                            className="admin-order-list__status-select"
                            value={orderStatus}
                            disabled={isBusy}
                            aria-label={`주문 ${order.orderNumber} 상태 변경`}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value,
                                orderStatus,
                                order.orderNumber,
                              )
                            }
                          >
                            {ADMIN_ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </div>
                  </div>
                )
              })}
          </div>

          <p className="order-list__footer-label">주문목록</p>
        </div>
      </div>
    </div>
  )
}

export default OrderManagement
