/** 홈 메인 히어로 배너 */
function HeroSection({ image, date, title, cta, ctaHref }) {
  return (
    <section className="mall-hero">
      <img src={image} alt={title} className="mall-hero__bg" />
      <div className="mall-hero__overlay" />
      <div className="mall-hero__content">
        <p className="mall-hero__date">{date}</p>
        <h1 className="mall-hero__title">{title}</h1>
        <a href={ctaHref} className="mall-hero__cta">
          {cta}
        </a>
      </div>
    </section>
  )
}

export default HeroSection
