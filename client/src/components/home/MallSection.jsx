/** 홈 공통 섹션 래퍼 (제목·부제 + children) */
function MallSection({ id, title, subtitle, children }) {
  const hasHead = Boolean(title || subtitle)

  return (
    <section className="mall-section" id={id}>
      {hasHead && (
        <div className="mall-section__head">
          <h2 className="mall-section__title">{title}</h2>
          <p className="mall-section__sub">{subtitle}</p>
        </div>
      )}
      {children}
    </section>
  )
}

export default MallSection
