/** 장바구니 페이지 — 수량 조절·선택 삭제·주문 이동 */
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CartQuantityStepper from '@/components/cart/CartQuantityStepper'
import Footer from '@/components/Footer'
import {
  CART_TABS,
  DEFAULT_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  MEMBER_DISCOUNT,
} from '@/constants/cart'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatWon } from '@/utils/formatPrice'
import '@/styles/cart.css'

/** 재고 기준 구매 가능 여부 */
const isItemPurchasable = (item) => {
  const stock = item.product?.stock
  if (typeof stock === 'number' && stock === 0) return false
  if (typeof stock === 'number' && item.quantity > stock) return false
  return true
}

/** 옵션 라벨 (수량은 수량 열 스테퍼에서 표시) */
const getOptionLabel = (item) => {
  const parts = [item.color, item.size].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : '단일 옵션'
}

function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { shouldRedirectToLogin, isLoading: authLoading } = useRequireAuth()
  const { items, subtotal, totalQuantity, isLoading, error, fetchCart, removeItems, updateItemQuantity } =
    useCart()

  const [activeTab, setActiveTab] = useState('regular')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [actionError, setActionError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  /** 수량 API 요청 중인 항목 ID */
  const [updatingQtyId, setUpdatingQtyId] = useState(null)

  const regularItems = items
  const subscriptionCount = 0

  const shippingFee = useMemo(() => {
    if (regularItems.length === 0) return 0
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE
  }, [regularItems.length, subtotal])

  const memberDiscount = isAuthenticated && regularItems.length > 0 ? MEMBER_DISCOUNT : 0
  const totalOrderAmount = Math.max(0, subtotal + shippingFee - memberDiscount)

  const allSelected =
    regularItems.length > 0 && regularItems.every((item) => selectedIds.has(item._id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(regularItems.map((item) => item._id)))
    }
  }

  const toggleSelect = (itemId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      setActionError('삭제할 상품을 선택해 주세요.')
      return
    }
    setIsProcessing(true)
    setActionError('')
    try {
      await removeItems([...selectedIds])
      setSelectedIds(new Set())
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  /** 수량 변경 — PUT /api/cart/items/:itemId */
  const handleQuantityChange = async (item, delta) => {
    const stock = item.product?.stock
    const nextQty = item.quantity + delta

    if (nextQty < 1) return
    if (typeof stock === 'number' && nextQty > stock) {
      setActionError(`재고는 ${stock}개까지 선택할 수 있습니다.`)
      return
    }

    setUpdatingQtyId(item._id)
    setActionError('')
    try {
      const result = await updateItemQuantity(item._id, nextQty)
      if (!result?.success) {
        setActionError(result?.message || '수량 변경에 실패했습니다.')
      }
    } catch (err) {
      setActionError(err.message || '수량 변경에 실패했습니다.')
    } finally {
      setUpdatingQtyId(null)
    }
  }

  const handleDeleteUnavailable = async () => {
    const unavailableIds = regularItems.filter((item) => !isItemPurchasable(item)).map((item) => item._id)
    if (unavailableIds.length === 0) {
      setActionError('품절 상품이 없습니다.')
      return
    }
    setIsProcessing(true)
    setActionError('')
    try {
      await removeItems(unavailableIds)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  /** 선택한 구매 가능 상품만 주문 페이지로 이동 */
  const handleGoToCheckout = () => {
    const ids = regularItems
      .filter((item) => selectedIds.has(item._id) && isItemPurchasable(item))
      .map((item) => item._id)
    if (ids.length === 0) {
      setActionError('주문할 상품을 선택해 주세요. (품절·재고 부족 상품은 선택 해제해 주세요)')
      return
    }
    setActionError('')
    navigate('/checkout', { state: { cartItemIds: ids } })
  }

  if (authLoading) {
    return null
  }

  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: '/cart' }} />
  }

  return (
    <div className="cart-page">
      <div className="cart">
        <h1 className="cart__title">장바구니</h1>

        <div className="cart__tabs" role="tablist">
          {CART_TABS.map((tab) => {
            const count = tab.id === 'regular' ? regularItems.length : subscriptionCount
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`cart__tab${activeTab === tab.id ? ' cart__tab--active' : ''}`}
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {count}
              </button>
            )
          })}
        </div>

        {isLoading && <p className="cart__state">장바구니를 불러오는 중…</p>}

        {error && !isLoading && (
          <div className="cart__state cart__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="cart__retry" onClick={fetchCart}>
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && activeTab === 'subscription' && (
          <p className="cart__state">정기구독 장바구니에 담긴 상품이 없습니다.</p>
        )}

        {!isLoading && !error && activeTab === 'regular' && regularItems.length === 0 && (
          <div className="cart__empty">
            <p>장바구니에 담긴 상품이 없습니다.</p>
            <Link to="/" className="cart__continue-link">
              쇼핑 계속하기
            </Link>
          </div>
        )}

        {!isLoading && !error && activeTab === 'regular' && regularItems.length > 0 && (
          <>
            <div className="cart-table-wrap">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th scope="col" className="cart-table__check">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        aria-label="전체 선택"
                      />
                    </th>
                    <th scope="col">상품정보</th>
                    <th scope="col" className="cart-table__qty">
                      수량
                    </th>
                    <th scope="col" className="cart-table__amount">
                      주문금액
                    </th>
                    <th scope="col" className="cart-table__ship">
                      배송정보
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regularItems.map((item, index) => {
                    const purchasable = isItemPurchasable(item)
                    const lineTotal = item.price * item.quantity
                    const productId = item.product?._id || item.product

                    return (
                      <tr key={item._id} className={!purchasable ? 'cart-table__row--disabled' : ''}>
                        <td className="cart-table__check">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item._id)}
                            onChange={() => toggleSelect(item._id)}
                            aria-label={`${item.name} 선택`}
                          />
                        </td>
                        <td className="cart-table__product">
                          <div className="cart-table__product-inner">
                            <Link to={`/products/${productId}`} className="cart-table__thumb-link">
                              <img src={item.image} alt="" className="cart-table__thumb" />
                            </Link>
                            <div className="cart-table__info">
                              <Link to={`/products/${productId}`} className="cart-table__name">
                                {item.name}
                              </Link>
                              <span className="cart-table__option">{getOptionLabel(item)}</span>
                              <Link
                                to={`/products/${productId}`}
                                className="cart-table__change-option"
                              >
                                옵션/수량 변경
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="cart-table__qty">
                          <CartQuantityStepper
                            quantity={item.quantity}
                            max={
                              typeof item.product?.stock === 'number'
                                ? item.product.stock
                                : undefined
                            }
                            disabled={!purchasable}
                            isUpdating={updatingQtyId === item._id}
                            onDecrease={() => handleQuantityChange(item, -1)}
                            onIncrease={() => handleQuantityChange(item, 1)}
                          />
                          {typeof item.product?.stock === 'number' &&
                            item.product.stock > 0 &&
                            item.quantity >= item.product.stock && (
                              <span className="cart-table__stock-hint">재고 {item.product.stock}개</span>
                            )}
                        </td>
                        <td className="cart-table__amount">
                          <p className="cart-table__line-price">{formatWon(lineTotal)}</p>
                          {purchasable ? (
                            <button type="button" className="cart-table__buy-now">
                              바로구매
                            </button>
                          ) : (
                            <span className="cart-table__unavailable">구매불가</span>
                          )}
                        </td>
                        <td className="cart-table__ship">
                          {shippingFee === 0
                            ? '무료 택배'
                            : index === 0
                              ? `${formatWon(DEFAULT_SHIPPING_FEE)} 택배`
                              : '무료 택배'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-toolbar">
              <div className="cart-toolbar__left">
                <label className="cart-toolbar__select-all">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  전체선택
                </label>
                <button
                  type="button"
                  className="cart-toolbar__btn"
                  onClick={handleDeleteSelected}
                  disabled={isProcessing}
                >
                  선택상품 삭제
                </button>
                <button
                  type="button"
                  className="cart-toolbar__btn"
                  onClick={handleDeleteUnavailable}
                  disabled={isProcessing}
                >
                  품절상품 삭제
                </button>
              </div>
              <p className="cart-toolbar__note">
                제품별 배송비 정책에 따라 배송비가 별도 부과될 수 있습니다.
              </p>
            </div>

            {actionError && (
              <p className="cart__action-error" role="alert">
                {actionError}
              </p>
            )}

            <div className="cart-summary">
              <h2 className="cart-summary__title">총 주문 상품 {totalQuantity}개</h2>
              <div className="cart-summary__calc">
                <div className="cart-summary__row">
                  <span className="cart-summary__label">상품금액</span>
                  <span className="cart-summary__value">{formatWon(subtotal)}</span>
                </div>
                <span className="cart-summary__operator">+</span>
                <div className="cart-summary__row">
                  <span className="cart-summary__label">배송비</span>
                  <span className="cart-summary__value">{formatWon(shippingFee)}</span>
                </div>
                {memberDiscount > 0 && (
                  <>
                    <span className="cart-summary__operator">-</span>
                    <div className="cart-summary__row">
                      <span className="cart-summary__label">회원 할인금액</span>
                      <span className="cart-summary__value cart-summary__value--discount">
                        {formatWon(memberDiscount)}
                      </span>
                    </div>
                  </>
                )}
                <span className="cart-summary__operator">=</span>
                <div className="cart-summary__row cart-summary__row--total">
                  <span className="cart-summary__label">총 주문금액</span>
                  <span className="cart-summary__total">{formatWon(totalOrderAmount)}</span>
                </div>
              </div>
            </div>

            <div className="cart-actions">
              <button
                type="button"
                className="cart-actions__order"
                onClick={handleGoToCheckout}
              >
                주문하기
              </button>
              <Link to="/" className="cart-actions__continue">
                계속 쇼핑하기
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Cart
