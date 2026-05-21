/**
 * 관리자 취소관리 — 취소된 주문·상품 목록 (GET /api/orders, orderStatus: cancelled)
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchOrders } from '@/api/orders'
import { cancelPayment, fetchOrderPayments } from '@/api/payments'
import {
  ADMIN_CANCEL_TABS,
  filterCancelledOrder,
} from '@/constants/adminCancelTabs'
import { ORDER_ITEM_STATUS_LABEL, ORDER_STATUS_LABEL } from '@/constants/orderStatusLabels'
import {
  formatOrderListDate,
  formatOrderListId,
  formatOrderListPrice,
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

function CancelManagement() {
  const [orders, setOrders] = useState([])
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(ADMIN_CANCEL_TABS[0].id)
  const [busyOrderId, setBusyOrderId] = useState(null)
  /** 주문별 결제 목록 캐시 (결제 취소 버튼용) */
  const [paymentsByOrderId, setPaymentsByOrderId] = useState({})

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const res = await fetchOrders()
      if (res.success) {
        const all = res.data || []
        setOrders(all.filter(filterCancelledOrder))
      } else {
        setLoadError(res.message || '취소 목록을 불러오지 못했습니다.')
      }
    } catch (err) {
      setLoadError(err.message || '취소 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const activeTabDef =
    ADMIN_CANCEL_TABS.find((t) => t.id === activeTab) || ADMIN_CANCEL_TABS[0]

  const filteredOrders = useMemo(
    () => orders.filter((o) => activeTabDef.match(o)),
    [orders, activeTabDef],
  )

  const tableRows = useMemo(() => flattenOrderRows(filteredOrders), [filteredOrders])

  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of ADMIN_CANCEL_TABS) {
      counts[tab.id] = orders.filter((o) => tab.match(o)).length
    }
    return counts
  }, [orders])

  /** 주문 결제 목록 조회 (GET /orders/:id/payments) */
  const loadPaymentsForOrder = async (orderId) => {
    if (paymentsByOrderId[orderId]) return paymentsByOrderId[orderId]

    const res = await fetchOrderPayments(orderId)
    const list = res.success ? res.data || [] : []
    setPaymentsByOrderId((prev) => ({ ...prev, [orderId]: list }))
    return list
  }

  /** 미완료 결제 취소 (DELETE /orders/:id/payments/:paymentId) */
  const handleCancelPayment = async (orderId, paymentId) => {
    if (!window.confirm('해당 결제 건을 취소 처리하시겠습니까?')) return

    setBusyOrderId(orderId)
    setActionError('')
    try {
      const res = await cancelPayment(orderId, paymentId)
      if (res.success) {
        setPaymentsByOrderId((prev) => {
          const next = { ...prev }
          delete next[orderId]
          return next
        })
        await loadOrders()
      } else {
        setActionError(res.message || '결제 취소에 실패했습니다.')
      }
    } catch (err) {
      setActionError(err.message || '결제 취소에 실패했습니다.')
    } finally {
      setBusyOrderId(null)
    }
  }

  /** 결제 취소 가능 여부 확인 후 처리 */
  const handlePaymentCancelClick = async (orderId) => {
    setBusyOrderId(orderId)
    setActionError('')
    try {
      const payments = await loadPaymentsForOrder(orderId)
      const cancellable = payments.filter(
        (p) => p.paymentStatus === 'pending' || p.paymentStatus === 'failed',
      )
      if (cancellable.length === 0) {
        setActionError('취소 가능한 결제 건이 없습니다.')
        return
      }
      await handleCancelPayment(orderId, cancellable[0]._id)
    } catch (err) {
      setActionError(err.message || '결제 정보를 불러오지 못했습니다.')
    } finally {
      setBusyOrderId(null)
    }
  }

  return (
    <div className="admin-main admin-main--orders admin-main--cancel">
      <header className="admin-main__header">
        <h1 className="admin-main__title">취소관리</h1>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn admin-btn--outline" onClick={loadOrders}>
            새로고침
          </button>
        </div>
      </header>

      <div className="order-list-page order-list-page--admin">
        <div className="order-list">
          <h2 className="order-list__title">CANCELLED</h2>

          <nav className="order-list__tabs" aria-label="취소 유형별 보기">
            {ADMIN_CANCEL_TABS.map((tab) => {
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
            className="order-list__table order-list__table--admin order-list__table--cancel"
            role="table"
            aria-label={`${activeTabDef.label} 취소 목록`}
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
              <span className="order-list__col order-list__col--cancel-date" role="columnheader">
                취소일
              </span>
              <span className="order-list__col order-list__col--order" role="columnheader">
                주문상태
              </span>
              <span className="order-list__col order-list__col--item-status" role="columnheader">
                상품상태
              </span>
              <span className="order-list__col order-list__col--actions" role="columnheader">
                관리
              </span>
            </div>

            {isLoading && <p className="order-list__state">취소 목록을 불러오는 중…</p>}

            {!isLoading && !loadError && tableRows.length === 0 && (
              <p className="order-list__state">
                {orders.length === 0
                  ? '취소된 주문이 없습니다.'
                  : `${activeTabDef.label} 항목이 없습니다.`}
              </p>
            )}

            {!isLoading &&
              !loadError &&
              tableRows.map(({ order, item }, idx) => {
                const prevOrderId = idx > 0 ? String(tableRows[idx - 1].order._id) : null
                const isPrimaryRow = prevOrderId !== String(order._id)

                const orderStatus = order.orderStatus
                const orderLabel = ORDER_STATUS_LABEL[orderStatus] || orderStatus
                const itemStatus = item?.itemStatus || 'cancelled'
                const itemLabel = ORDER_ITEM_STATUS_LABEL[itemStatus] || itemStatus
                const isBusy = busyOrderId === order._id
                const memberName = order.user?.name || '—'
                const cancelDate = order.cancelledAt || order.updatedAt

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
                      {item?.optionName ? (
                        <span className="order-list__item-option">{item.optionName}</span>
                      ) : null}
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

                    <div className="order-list__col order-list__col--cancel-date" role="cell">
                      <span className="order-list__cancel-date">
                        {formatOrderListDate(cancelDate)}
                      </span>
                    </div>

                    <div className="order-list__col order-list__col--order" role="cell">
                      <span className="order-list__status-main order-list__status-main--cancelled">
                        {orderLabel}
                      </span>
                    </div>

                    <div className="order-list__col order-list__col--item-status" role="cell">
                      <span className="order-list__item-status">{itemLabel}</span>
                    </div>

                    <div className="order-list__col order-list__col--actions" role="cell">
                      {isPrimaryRow ? (
                        <div className="admin-order-list__actions">
                          {!order.paidAt && (
                            <button
                              type="button"
                              className="admin-order-list__action-btn admin-order-list__action-btn--danger"
                              disabled={isBusy}
                              onClick={() => handlePaymentCancelClick(order._id)}
                            >
                              결제 취소
                            </button>
                          )}
                          {!order.paidAt ? null : (
                            <span className="admin-order-list__action-muted">환불 연동 예정</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
          </div>

          <p className="order-list__footer-label">취소목록</p>
        </div>
      </div>
    </div>
  )
}

export default CancelManagement
