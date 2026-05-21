/** 홈 중간 프로모션 배너 */
function PromoBanner({ image, title, subtitle, cta, ctaHref }) {
  return (
    <section className="mall-banner">
      <img src={image} alt={title} className="mall-banner__bg" loading="lazy" />
      <div className="mall-banner__overlay" />
      <div className="mall-banner__content">
        <h2 className="mall-banner__title">{title}</h2>
        <p className="mall-banner__sub">{subtitle}</p>
        <a href={ctaHref} className="mall-banner__btn">
          {cta}
        </a>
      </div>
    </section>
  )
}

export default PromoBanner
