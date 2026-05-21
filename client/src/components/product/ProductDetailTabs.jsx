/**
 * 상품 상세 하단 탭: 상품정보 · 상품후기 · 상품 Q&A
 */
import { useState } from 'react'
import {
  MOCK_PRODUCT_QA,
  MOCK_PRODUCT_REVIEWS,
  PRODUCT_DETAIL_GUIDE,
  PRODUCT_DETAIL_TABS,
} from '@/constants/productDetailTabs'
import { getProductCategoryLabel } from '@/utils/productDisplay'
import { getProductOptionSets } from '@/utils/productOptions'

function ProductDetailTabs({ product }) {
  const [activeTab, setActiveTab] = useState('info')
  const { sizes, colors } = getProductOptionSets(product)

  const reviewCount = MOCK_PRODUCT_REVIEWS.length
  const qaCount = MOCK_PRODUCT_QA.length
  const averageRating =
    reviewCount > 0
      ? (
          MOCK_PRODUCT_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        ).toFixed(1)
      : '0'

  const tabCounts = {
    info: null,
    reviews: reviewCount,
    qa: qaCount,
  }

  return (
    <section className="product-detail-tabs" aria-label="상품 상세 탭">
      <div className="product-detail-tabs__nav" role="tablist">
        {PRODUCT_DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`product-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`product-panel-${tab.id}`}
            className={`product-detail-tabs__tab${
              activeTab === tab.id ? ' product-detail-tabs__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tabCounts[tab.id] != null && (
              <span className="product-detail-tabs__count">({tabCounts[tab.id]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="product-detail-tabs__panels">
        {activeTab === 'info' && (
          <div
            id="product-panel-info"
            role="tabpanel"
            aria-labelledby="product-tab-info"
            className="product-detail-tabs__panel"
          >
            <div className="product-detail-tabs__detail-hero">
              <img
                src={product.image}
                alt={`${product.name} 상세 이미지`}
                className="product-detail-tabs__detail-image"
              />
            </div>

            {product.description ? (
              <div className="product-detail-tabs__block">
                <h3 className="product-detail-tabs__block-title">상품 설명</h3>
                <p className="product-detail-tabs__text">{product.description}</p>
              </div>
            ) : (
              <p className="product-detail-tabs__empty">등록된 상품 설명이 없습니다.</p>
            )}

            <div className="product-detail-tabs__block">
              <h3 className="product-detail-tabs__block-title">기본 정보</h3>
              <table className="product-detail-tabs__spec-table">
                <tbody>
                  <tr>
                    <th scope="row">상품명</th>
                    <td>{product.name}</td>
                  </tr>
                  <tr>
                    <th scope="row">SKU</th>
                    <td>{product.sku}</td>
                  </tr>
                  <tr>
                    <th scope="row">분류</th>
                    <td>{getProductCategoryLabel(product.category)}</td>
                  </tr>
                  <tr>
                    <th scope="row">사이즈</th>
                    <td>{sizes.join(', ')}</td>
                  </tr>
                  <tr>
                    <th scope="row">색상</th>
                    <td>{colors.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="product-detail-tabs__block">
              <h3 className="product-detail-tabs__block-title">배송·교환 안내</h3>
              <table className="product-detail-tabs__spec-table">
                <tbody>
                  {PRODUCT_DETAIL_GUIDE.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div
            id="product-panel-reviews"
            role="tabpanel"
            aria-labelledby="product-tab-reviews"
            className="product-detail-tabs__panel"
          >
            <div className="product-detail-tabs__summary">
              <p className="product-detail-tabs__rating">
                <span className="product-detail-tabs__rating-value">{averageRating}</span>
                <span className="product-detail-tabs__stars" aria-hidden="true">
                  ★★★★★
                </span>
              </p>
              <p className="product-detail-tabs__summary-text">
                총 <strong>{reviewCount}</strong>건의 후기
              </p>
            </div>

            <ul className="product-detail-tabs__review-list">
              {MOCK_PRODUCT_REVIEWS.map((review) => (
                <li key={review.id} className="product-detail-tabs__review-item">
                  <div className="product-detail-tabs__review-head">
                    <span className="product-detail-tabs__review-stars" aria-label={`${review.rating}점`}>
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="product-detail-tabs__review-author">{review.author}</span>
                    <time className="product-detail-tabs__review-date" dateTime={review.date}>
                      {review.date}
                    </time>
                  </div>
                  <p className="product-detail-tabs__review-option">옵션: {review.option}</p>
                  <p className="product-detail-tabs__review-text">{review.text}</p>
                  <p className="product-detail-tabs__review-helpful">도움이 돼요 {review.helpful}</p>
                </li>
              ))}
            </ul>

            <button type="button" className="product-detail-tabs__action-btn">
              후기 작성하기
            </button>
          </div>
        )}

        {activeTab === 'qa' && (
          <div
            id="product-panel-qa"
            role="tabpanel"
            aria-labelledby="product-tab-qa"
            className="product-detail-tabs__panel"
          >
            <p className="product-detail-tabs__qa-notice">
              상품에 대한 궁금한 점을 문의해 주세요. 비밀글로 작성하면 작성자와 관리자만 볼 수 있습니다.
            </p>

            <ul className="product-detail-tabs__qa-list">
              {MOCK_PRODUCT_QA.map((item) => (
                <li key={item.id} className="product-detail-tabs__qa-item">
                  <div className="product-detail-tabs__qa-question">
                    <span
                      className={`product-detail-tabs__qa-badge${
                        item.status === 'answered'
                          ? ' product-detail-tabs__qa-badge--answered'
                          : ''
                      }`}
                    >
                      {item.status === 'answered' ? '답변완료' : '답변대기'}
                    </span>
                    {item.isSecret && (
                      <span className="product-detail-tabs__qa-secret">비밀글</span>
                    )}
                    <span className="product-detail-tabs__qa-author">{item.author}</span>
                    <time className="product-detail-tabs__qa-date" dateTime={item.date}>
                      {item.date}
                    </time>
                    <p className="product-detail-tabs__qa-text">{item.question}</p>
                  </div>
                  {item.answer && (
                    <div className="product-detail-tabs__qa-answer">
                      <p className="product-detail-tabs__qa-answer-label">판매자 답변</p>
                      <p className="product-detail-tabs__qa-answer-text">{item.answer}</p>
                      {item.answeredAt && (
                        <time className="product-detail-tabs__qa-answer-date" dateTime={item.answeredAt}>
                          {item.answeredAt}
                        </time>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" className="product-detail-tabs__action-btn">
              문의하기
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductDetailTabs
