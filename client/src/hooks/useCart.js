/** CartContext 접근 훅 */
import { useContext } from 'react'
import { CartContext } from '@/context/cartContext'

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart는 CartProvider 내부에서만 사용할 수 있습니다.')
  }

  return context
}
