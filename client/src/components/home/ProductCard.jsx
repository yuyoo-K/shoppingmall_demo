/** 홈 상품 카드 한 개 (클릭 시 상세 페이지로 이동) */
import { Link } from 'react-router-dom'
import { formatPrice } from '@/utils/formatPrice'

function ProductCard({ product, sale = false }) {
  const content = (
    <>
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} className="product-card__image" loading="lazy" />
      </div>
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__price">
        {sale && product.originalPrice && (
          <span className="product-card__original">{formatPrice(product.originalPrice)}</span>
        )}
        <span className={sale ? 'product-card__sale' : ''}>{formatPrice(product.price)}</span>
      </p>
    </>
  )

  if (product.id) {
    return (
      <Link to={`/products/${product.id}`} className="product-card product-card--link">
        {content}
      </Link>
    )
  }

  return <article className="product-card">{content}</article>
}

export default ProductCard
