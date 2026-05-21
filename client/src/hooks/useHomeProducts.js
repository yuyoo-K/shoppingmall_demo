/** 홈 화면 전체 상품 목록 (API all=true) */
import { useEffect, useState } from 'react'
import { getAllProducts } from '@/api/products'
import { mapProductToCard } from '@/utils/mapProductToCard'

export function useHomeProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      setIsLoading(true)
      setError('')

      try {
        const result = await getAllProducts()
        if (cancelled) return

        const items = Array.isArray(result.data) ? result.data.map(mapProductToCard) : []
        setProducts(items)
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(err.message || '상품을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      cancelled = true
    }
  }, [])

  return { products, isLoading, error }
}
