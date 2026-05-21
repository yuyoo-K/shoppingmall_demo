/** 상품 목록 페이지 네비게이션 */
function ProductPagination({ page, totalPages, total, limit, onPageChange }) {
  if (total === 0) {
    return null
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange(nextPage)
  }

  const pageNumbers = []
  const maxVisible = 5
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
    pageNumbers.push(pageNumber)
  }

  return (
    <div className="admin-pagination">
      <p className="admin-pagination__summary">
        총 <strong>{total.toLocaleString('ko-KR')}</strong>건 · {start.toLocaleString('ko-KR')}–
        {end.toLocaleString('ko-KR')}번째 표시
      </p>
      <nav className="admin-pagination__nav" aria-label="상품 목록 페이지">
        <button
          type="button"
          className="admin-pagination__btn"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          이전
        </button>
        {startPage > 1 && (
          <>
            <button type="button" className="admin-pagination__btn" onClick={() => goToPage(1)}>
              1
            </button>
            {startPage > 2 && <span className="admin-pagination__ellipsis">…</span>}
          </>
        )}
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`admin-pagination__btn${
              pageNumber === page ? ' admin-pagination__btn--active' : ''
            }`}
            onClick={() => goToPage(pageNumber)}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="admin-pagination__ellipsis">…</span>}
            <button type="button" className="admin-pagination__btn" onClick={() => goToPage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          className="admin-pagination__btn"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          다음
        </button>
      </nav>
    </div>
  )
}

export default ProductPagination
