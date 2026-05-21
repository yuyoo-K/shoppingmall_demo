/**
 * 장바구니 수량 조절 버튼 (− / 수량 / +)
 */
function CartQuantityStepper({
  quantity,
  min = 1,
  max,
  disabled = false,
  isUpdating = false,
  onDecrease,
  onIncrease,
}) {
  const atMin = quantity <= min
  const atMax = typeof max === 'number' && quantity >= max

  return (
    <div className="cart-qty" role="group" aria-label="수량 조절">
      <button
        type="button"
        className="cart-qty__btn"
        aria-label="수량 줄이기"
        disabled={disabled || isUpdating || atMin}
        onClick={onDecrease}
      >
        −
      </button>
      <span className="cart-qty__value" aria-live="polite">
        {isUpdating ? '…' : quantity}
      </span>
      <button
        type="button"
        className="cart-qty__btn"
        aria-label="수량 늘리기"
        disabled={disabled || isUpdating || atMax}
        onClick={onIncrease}
      >
        +
      </button>
    </div>
  )
}

export default CartQuantityStepper
