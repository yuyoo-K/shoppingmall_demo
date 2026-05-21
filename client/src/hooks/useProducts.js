/**
 * 관리자 상품 목록 조회 (페이지네이션·필터 파라미터)
 */
import { useCallback, useState } from 'react'
import { getProducts } from '@/api/products'
import { DEFAULT_PRODUCT_PAGE_SIZE } from '@/constants/pagination'

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_PRODUCT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(INITIAL_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async (params = {}) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await getProducts(params)
      setProducts(Array.isArray(result.data) ? result.data : [])
      setPagination(result.pagination ?? INITIAL_PAGINATION)
    } catch (err) {
      setProducts([])
      setPagination(INITIAL_PAGINATION)
      setError(err.message || '상품 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
  }
}
