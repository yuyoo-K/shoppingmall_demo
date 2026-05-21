/** 상품 그리드 섹션 (기획전·할인 등) */
import MallSection from '@/components/home/MallSection'
import ProductCard from '@/components/home/ProductCard'

function ProductSection({ id, title, subtitle, products, sale = false }) {
  return (
    <MallSection id={id} title={title} subtitle={subtitle}>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} sale={sale} />
        ))}
      </div>
    </MallSection>
  )
}

export default ProductSection
