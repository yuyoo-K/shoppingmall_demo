/** URL의 상품 ID로 단일 상품 조회 */
import { useEffect, useState } from 'react'
import { getProductById } from '@/api/products'

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) {
      setProduct(null)
      setIsLoading(false)
      setError('상품 ID가 없습니다.')
      return undefined
    }

    let cancelled = false

    const fetchProduct = async () => {
      setIsLoading(true)
      setError('')
      setProduct(null)

      try {
        const result = await getProductById(productId)
        if (cancelled) return

        if (result.success && result.data) {
          setProduct(result.data)
        } else {
          setError('상품을 찾을 수 없습니다.')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '상품을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  return { product, isLoading, error }
}
