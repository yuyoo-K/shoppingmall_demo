/**
 * 전역 장바구니 Provider
 * - 로그인 시 조회, 담기·삭제 시 헤더 배지 등 전역 상태 동기화
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addCartItem as addCartItemApi,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/api/cart'
import { CartContext } from '@/context/cartContext'
import { useAuth } from '@/hooks/useAuth'

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      setError('')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await getCart()
      setCart(result.data ?? null)
    } catch (err) {
      setCart(null)
      setError(err.message || '장바구니를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (payload) => {
    const result = await addCartItemApi(payload)
    setCart(result.data ?? null)
    return result
  }

  const updateItemQuantity = async (itemId, quantity) => {
    const result = await updateCartItem(itemId, { quantity })
    setCart(result.data ?? null)
    return result
  }

  const removeItem = async (itemId) => {
    const result = await removeCartItem(itemId)
    setCart(result.data ?? null)
    return result
  }

  const removeItems = async (itemIds) => {
    for (const itemId of itemIds) {
      await removeCartItem(itemId)
    }
    await fetchCart()
  }

  const emptyCart = async () => {
    const result = await clearCart()
    setCart(result.data ?? null)
    return result
  }

  const value = useMemo(
    () => ({
      cart,
      items: cart?.items ?? [],
      subtotal: cart?.subtotal ?? 0,
      totalQuantity: cart?.totalQuantity ?? 0,
      isLoading,
      error,
      fetchCart,
      addItem,
      updateItemQuantity,
      removeItem,
      removeItems,
      emptyCart,
    }),
    [cart, isLoading, error, fetchCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
