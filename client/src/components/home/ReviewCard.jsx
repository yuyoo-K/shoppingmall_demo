/** 리뷰 카드 한 개 */
function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <img src={review.image} alt="" className="review-card__bg" loading="lazy" />
      <div className="review-card__overlay" />
      <div className="review-card__content">
        <time className="review-card__date">{review.date}</time>
        <p className="review-card__text">{review.text}</p>
        <p className="review-card__stars" aria-label="5점">
          ★★★★★
        </p>
      </div>
    </article>
  )
}

export default ReviewCard
