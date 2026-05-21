/** 고객 리뷰 그리드 섹션 */
import MallSection from '@/components/home/MallSection'
import ReviewCard from '@/components/home/ReviewCard'

function ReviewSection({ id, title, subtitle, reviews }) {
  return (
    <MallSection id={id} title={title} subtitle={subtitle}>
      <div className="review-grid">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </MallSection>
  )
}

export default ReviewSection
