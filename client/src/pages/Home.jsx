/** 홈 페이지: 히어로, 전체 상품, 리뷰, 프로모, 클래스 섹션 */
import Footer from '@/components/Footer'
import ClassSection from '@/components/home/ClassSection'
import HeroSection from '@/components/home/HeroSection'
import ProductCard from '@/components/home/ProductCard'
import PromoBanner from '@/components/home/PromoBanner'
import ReviewSection from '@/components/home/ReviewSection'
import {
  CLASS_SECTION,
  HERO_CONTENT,
  PROMO_BANNER,
  REVIEW_SECTION,
} from '@/constants/homeSections'
import { useHomeProducts } from '@/hooks/useHomeProducts'
import '@/styles/home.css'

const SHOP_SECTION = {
  id: 'shop',
  title: '전체 상품',
  subtitle: '등록된 전체 상품을 만나보세요',
}

function Home() {
  const { products, isLoading, error } = useHomeProducts()

  return (
    <div className="home-page">
      <HeroSection {...HERO_CONTENT} />

      <section id={SHOP_SECTION.id} className="mall-section home-products">
        <div className="mall-section__head">
          <h2 className="mall-section__title">{SHOP_SECTION.title}</h2>
          <p className="mall-section__sub">{SHOP_SECTION.subtitle}</p>
        </div>

        {isLoading && <p className="home-products__state">상품을 불러오는 중…</p>}

        {error && (
          <p className="home-products__state home-products__state--error" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p className="home-products__state">등록된 상품이 없습니다.</p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <ReviewSection {...REVIEW_SECTION} />
      <PromoBanner {...PROMO_BANNER} />
      <ClassSection {...CLASS_SECTION} />
      <Footer />
    </div>
  )
}

export default Home
