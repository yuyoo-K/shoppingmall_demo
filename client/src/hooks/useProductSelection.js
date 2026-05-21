/**
 * 상품 상세: 사이즈·색상·수량 선택 state 및 검증
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProductOptionSets } from '@/utils/productOptions'

export function useProductSelection(product) {
  const { sizes, colors, stock, maxQuantity } = useMemo(
    () => getProductOptionSets(product),
    [product],
  )

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [optionError, setOptionError] = useState('')

  // 상품이 바뀌면 선택값 초기화
  useEffect(() => {
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setOptionError('')
  }, [product?._id])

  const validateSelection = useCallback(() => {
    if (sizes.length > 0 && !selectedSize) {
      return '사이즈를 선택해 주세요.'
    }
    if (colors.length > 0 && !selectedColor) {
      return '색상을 선택해 주세요.'
    }
    if (quantity < 1) {
      return '수량은 1개 이상이어야 합니다.'
    }
    if (stock === 0) {
      return '품절된 상품입니다.'
    }
    if (quantity > maxQuantity) {
      return `수량은 최대 ${maxQuantity}개까지 선택할 수 있습니다.`
    }
    return ''
  }, [sizes.length, colors.length, selectedSize, selectedColor, quantity, stock, maxQuantity])

  const clearOptionError = () => setOptionError('')

  const handleSizeChange = (size) => {
    setSelectedSize(size)
    clearOptionError()
  }

  const handleColorChange = (color) => {
    setSelectedColor(color)
    clearOptionError()
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
    clearOptionError()
  }

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1))
    clearOptionError()
  }

  const handleQuantityInput = (value) => {
    const parsed = parseInt(String(value), 10)
    if (Number.isNaN(parsed)) {
      setQuantity(1)
      return
    }
    setQuantity(Math.min(maxQuantity, Math.max(1, parsed)))
    clearOptionError()
  }

  /** 장바구니·구매 전 옵션 검증 (실패 시 optionError 설정) */
  const requireValidSelection = () => {
    const message = validateSelection()
    if (message) {
      setOptionError(message)
      return null
    }
    return {
      size: selectedSize,
      color: selectedColor,
      quantity,
    }
  }

  return {
    sizes,
    colors,
    stock,
    maxQuantity,
    selectedSize,
    selectedColor,
    quantity,
    optionError,
    isSoldOut: stock === 0,
    handleSizeChange,
    handleColorChange,
    decreaseQuantity,
    increaseQuantity,
    handleQuantityInput,
    requireValidSelection,
  }
}
