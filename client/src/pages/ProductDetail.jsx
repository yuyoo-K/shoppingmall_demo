/** 상품 상세 페이지 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import ProductDetailOptions from '@/components/product/ProductDetailOptions'
import ProductDetailTabs from '@/components/product/ProductDetailTabs'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useProductDetail } from '@/hooks/useProductDetail'
import { useProductSelection } from '@/hooks/useProductSelection'
import { formatPrice } from '@/utils/formatPrice'
import { getProductCategoryLabel } from '@/utils/productDisplay'
import '@/styles/productDetail.css'

function ProductDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { product, isLoading, error } = useProductDetail(productId)
  const [cartError, setCartError] = useState('')
  const [cartSuccess, setCartSuccess] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const selection = useProductSelection(product)
  const {
    sizes,
    colors,
    stock,
    maxQuantity,
    selectedSize,
    selectedColor,
    quantity,
    optionError,
    isSoldOut,
    handleSizeChange,
    handleColorChange,
    decreaseQuantity,
    increaseQuantity,
    handleQuantityInput,
    requireValidSelection,
  } = selection

  // redirectToCart: 바로 구매 시에만 장바구니로 이동, 담기는 쇼핑 계속
  const addProductToCart = async ({ redirectToCart = false } = {}) => {
    const selected = requireValidSelection()
    if (!selected) return

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } })
      return
    }

    setIsAddingToCart(true)
    setCartError('')
    setCartSuccess('')

    try {
      await addItem({
        productId: product._id,
        quantity: selected.quantity,
        size: selected.size,
        color: selected.color,
      })
      if (redirectToCart) {
        navigate('/cart')
      } else {
        setCartSuccess('장바구니에 담았습니다. 쇼핑을 계속하실 수 있습니다.')
      }
    } catch (err) {
      setCartError(err.message)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToCart = () => addProductToCart()
  const handleBuyNow = () => addProductToCart({ redirectToCart: true })

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <nav className="product-detail__nav" aria-label="상품 상세 탐색">
          <Link to="/" className="product-detail__back">
            ← 쇼핑 계속하기
          </Link>
        </nav>

        {isLoading && <p className="product-detail__state">상품 정보를 불러오는 중…</p>}

        {error && !isLoading && (
          <div className="product-detail__state product-detail__state--error" role="alert">
            <p>{error}</p>
            <Link to="/" className="product-detail__back-link">
              홈으로 돌아가기
            </Link>
          </div>
        )}

        {!isLoading && !error && product && (
          <>
          <div className="product-detail__layout">
            <div className="product-detail__media">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail__image"
              />
            </div>

            <div className="product-detail__info">
              <p className="product-detail__sku">SKU: {product.sku}</p>
              <h1 className="product-detail__name">{product.name}</h1>
              <p className="product-detail__price">{formatPrice(product.price)}</p>

              <dl className="product-detail__meta">
                <div className="product-detail__meta-row">
                  <dt>분류</dt>
                  <dd>{getProductCategoryLabel(product.category)}</dd>
                </div>
              </dl>

              <ProductDetailOptions
                sizes={sizes}
                colors={colors}
                stock={stock}
                maxQuantity={maxQuantity}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                quantity={quantity}
                optionError={optionError}
                isSoldOut={isSoldOut}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
                onDecreaseQuantity={decreaseQuantity}
                onIncreaseQuantity={increaseQuantity}
                onQuantityInput={handleQuantityInput}
              />

              {cartSuccess && (
                <p className="product-detail__cart-success" role="status">
                  {cartSuccess}
                </p>
              )}

              {cartError && (
                <p className="product-detail__cart-error" role="alert">
                  {cartError}
                </p>
              )}

              <div className="product-detail__actions">
                <button
                  type="button"
                  className="product-detail__btn product-detail__btn--primary"
                  onClick={handleAddToCart}
                  disabled={isSoldOut || isAddingToCart}
                >
                  {isSoldOut ? '품절' : isAddingToCart ? '담는 중…' : '장바구니 담기'}
                </button>
                <button
                  type="button"
                  className="product-detail__btn product-detail__btn--outline"
                  onClick={handleBuyNow}
                  disabled={isSoldOut || isAddingToCart}
                >
                  바로 구매
                </button>
              </div>
            </div>
          </div>

          <ProductDetailTabs product={product} />
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetail
