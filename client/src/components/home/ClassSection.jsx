/** 오프라인 클래스 섹션 */
import MallSection from '@/components/home/MallSection'
import { formatPrice } from '@/utils/formatPrice'

function ClassSection({ id, title, subtitle, classes }) {
  return (
    <MallSection id={id} title={title} subtitle={subtitle}>
      <div className="class-grid">
        {classes.map((item) => (
          <article key={item.id} className="class-card">
            <img src={item.image} alt={item.title} className="class-card__image" loading="lazy" />
            <h3 className="class-card__title">{item.title}</h3>
            <p className="class-card__price">{formatPrice(item.price)}</p>
          </article>
        ))}
      </div>
    </MallSection>
  )
}

export default ClassSection
