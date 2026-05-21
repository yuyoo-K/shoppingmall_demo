/** 관리자 상품관리: 목록·검색·등록·수정·삭제 */
import { useCallback, useEffect, useState } from 'react'
import { deleteProduct } from '@/api/products'
import AdminCategorySidebar from '@/components/admin/AdminCategorySidebar'
import ProductConfirmModal from '@/components/admin/ProductConfirmModal'
import ProductPagination from '@/components/admin/ProductPagination'
import ProductRegisterModal from '@/components/admin/ProductRegisterModal'
import ProductTable from '@/components/admin/ProductTable'
import { PRODUCT_STATUS_TABS } from '@/constants/admin'
import { DEFAULT_PRODUCT_PAGE_SIZE, PRODUCT_PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { useProducts } from '@/hooks/useProducts'
import { buildCategoryQueryParams } from '@/utils/categoryFilter'

function ProductManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PRODUCT_PAGE_SIZE)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const { products, pagination, isLoading, error, fetchProducts } = useProducts()

  const buildListParams = useCallback(
    (overrides = {}) => ({
      page,
      limit: pageSize,
      ...buildCategoryQueryParams(activeCategoryId),
      ...(searchQuery ? { search: searchQuery } : {}),
      ...overrides,
    }),
    [page, pageSize, searchQuery, activeCategoryId],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(search.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchProducts(buildListParams())
  }, [page, pageSize, searchQuery, activeCategoryId, fetchProducts, buildListParams])

  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId)
    setPage(1)
    setActionError('')
  }

  const refreshList = () => {
    fetchProducts(buildListParams())
  }

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value))
    setPage(1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
  }

  const handleRegisterSuccess = () => {
    setActionError('')
    refreshList()
  }

  const handleEdit = (product) => {
    setActionError('')
    setEditingProduct(product)
  }

  const handleDeleteRequest = (product) => {
    setActionError('')
    setDeletingProduct(product)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return

    setIsDeleting(true)
    setActionError('')

    try {
      await deleteProduct(deletingProduct._id)
      setDeletingProduct(null)

      const isLastItemOnPage = products.length === 1 && page > 1
      if (isLastItemOnPage) {
        setPage((prev) => prev - 1)
      } else {
        refreshList()
      }
    } catch (err) {
      setActionError(err.message || '상품 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-main">
      <header className="admin-main__header">
        <h1 className="admin-main__title">상품관리</h1>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn admin-btn--outline">
            상품 일괄 추가
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => {
              setActionError('')
              setIsRegisterOpen(true)
            }}
          >
            새 상품 추가하기
          </button>
        </div>
      </header>

      <div className="admin-main__body">
        <AdminCategorySidebar
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        <div className="admin-content">
          <div className="admin-tabs">
            {PRODUCT_STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-tabs__item${activeTab === tab.id ? ' admin-tabs__item--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {tab.id === 'all' ? pagination.total : tab.count}
              </button>
            ))}
          </div>

          <div className="admin-toolbar">
            <div className="admin-search">
              <input
                type="search"
                className="admin-search__input"
                placeholder="상품명/SKU 검색"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <span className="admin-search__icon" aria-hidden="true">
                ⌕
              </span>
            </div>
            <div className="admin-toolbar__right">
              <select
                className="admin-toolbar__select"
                value={pageSize}
                onChange={handlePageSizeChange}
                aria-label="페이지당 상품 수"
              >
                {PRODUCT_PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}개씩 보기
                  </option>
                ))}
              </select>
              <button type="button" className="admin-btn admin-btn--outline admin-btn--sm">
                엑셀 다운로드
              </button>
            </div>
          </div>

          {actionError && (
            <p className="admin-content__error" role="alert">
              {actionError}
            </p>
          )}

          <ProductTable
            products={products}
            pagination={pagination}
            isLoading={isLoading}
            error={error}
            emptyMessage={
              activeCategoryId === 'all'
                ? '등록된 상품이 없습니다. 새 상품 추가하기로 등록해 보세요.'
                : '선택한 카테고리에 등록된 상품이 없습니다.'
            }
            onRetry={refreshList}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />

          {!isLoading && !error && pagination.total > 0 && (
            <ProductPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {isRegisterOpen && (
        <ProductRegisterModal
          mode="create"
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {editingProduct && (
        <ProductRegisterModal
          mode="edit"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {deletingProduct && (
        <ProductConfirmModal
          title="상품 삭제"
          message={`"${deletingProduct.name}" 상품을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
          confirmLabel="삭제"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => !isDeleting && setDeletingProduct(null)}
        />
      )}
    </div>
  )
}

export default ProductManagement
