/** 관리자 상품 목록 테이블 */
import { formatPrice } from '@/utils/formatPrice'
import { formatProductDate, getProductCategoryLabel } from '@/utils/productDisplay'

function ProductTable({
  products = [],
  pagination = null,
  isLoading = false,
  error = '',
  emptyMessage = '등록된 상품이 없습니다. 새 상품 추가하기로 등록해 보세요.',
  onRetry,
  onEdit,
  onDelete,
}) {
  if (isLoading) {
    return (
      <div className="admin-table-wrap admin-table-wrap--state">
        <p className="admin-table__state">상품 목록을 불러오는 중…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-table-wrap admin-table-wrap--state">
        <p className="admin-table__state admin-table__state--error" role="alert">
          {error}
        </p>
        {onRetry && (
          <button type="button" className="admin-btn admin-btn--outline admin-btn--sm" onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="admin-table-wrap admin-table-wrap--state">
        <p className="admin-table__state">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">
              <input type="checkbox" aria-label="전체 선택" />
            </th>
            <th scope="col">No</th>
            <th scope="col">상품명</th>
            <th scope="col">판매가</th>
            <th scope="col">분류</th>
            <th scope="col">SKU</th>
            <th scope="col">등록일</th>
            <th scope="col">수정일</th>
            <th scope="col">관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product._id}>
              <td>
                <input type="checkbox" aria-label={`${product.name} 선택`} />
              </td>
              <td>
                {pagination
                  ? pagination.total - (pagination.page - 1) * pagination.limit - index
                  : products.length - index}
              </td>
              <td>
                <div className="admin-table__product">
                  <img
                    src={product.image}
                    alt=""
                    className="admin-table__thumb"
                    loading="lazy"
                  />
                  <div className="admin-table__product-info">
                    <p className="admin-table__name">{product.name}</p>
                    {product.description && (
                      <p className="admin-table__variants">{product.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td>{formatPrice(product.price)}</td>
              <td>{getProductCategoryLabel(product.category)}</td>
              <td>{product.sku}</td>
              <td>{formatProductDate(product.createdAt)}</td>
              <td>{formatProductDate(product.updatedAt)}</td>
              <td>
                <div className="admin-table__actions">
                  <button
                    type="button"
                    className="admin-table__action-btn"
                    onClick={() => onEdit?.(product)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="admin-table__action-btn admin-table__action-btn--danger"
                    onClick={() => onDelete?.(product)}
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
