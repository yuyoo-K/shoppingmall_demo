/**
 * 상품 상세: 사이즈·색상·수량 선택 UI
 */
import { getColorSwatch } from '@/utils/productOptions'

function ProductDetailOptions({
  sizes = [],
  colors = [],
  stock = 0,
  maxQuantity = 1,
  selectedSize,
  selectedColor,
  quantity,
  optionError,
  isSoldOut = false,
  onSizeChange,
  onColorChange,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onQuantityInput,
}) {
  return (
    <section className="product-detail__options" aria-label="상품 옵션 선택">
      {sizes.length > 0 && (
        <div className="product-detail__option-group">
          <p className="product-detail__option-label">
            사이즈
            {selectedSize && <span className="product-detail__option-selected"> · {selectedSize}</span>}
          </p>
          <div className="product-detail__option-list" role="list">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                role="listitem"
                className={`product-detail__chip${
                  selectedSize === size ? ' product-detail__chip--active' : ''
                }`}
                onClick={() => onSizeChange(size)}
                disabled={isSoldOut}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="product-detail__option-group">
          <p className="product-detail__option-label">
            색상
            {selectedColor && (
              <span className="product-detail__option-selected"> · {selectedColor}</span>
            )}
          </p>
          <div className="product-detail__option-list product-detail__option-list--colors">
            {colors.map((color) => {
              const swatch = getColorSwatch(color)
              const isLight = swatch === '#ffffff' || swatch === '#e9ecef'

              return (
                <button
                  key={color}
                  type="button"
                  className={`product-detail__color-chip${
                    selectedColor === color ? ' product-detail__color-chip--active' : ''
                  }`}
                  onClick={() => onColorChange(color)}
                  disabled={isSoldOut}
                  aria-pressed={selectedColor === color}
                  aria-label={color}
                  title={color}
                >
                  <span
                    className="product-detail__color-swatch"
                    style={{
                      backgroundColor: swatch,
                      border: isLight ? '1px solid #dee2e6' : undefined,
                    }}
                  />
                  <span className="product-detail__color-name">{color}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="product-detail__option-group">
        <p className="product-detail__option-label">수량</p>
        <div className="product-detail__quantity">
          <button
            type="button"
            className="product-detail__quantity-btn"
            onClick={onDecreaseQuantity}
            disabled={isSoldOut || quantity <= 1}
            aria-label="수량 줄이기"
          >
            −
          </button>
          <input
            type="number"
            className="product-detail__quantity-input"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(event) => onQuantityInput(event.target.value)}
            disabled={isSoldOut}
            aria-label="구매 수량"
          />
          <button
            type="button"
            className="product-detail__quantity-btn"
            onClick={onIncreaseQuantity}
            disabled={isSoldOut || quantity >= maxQuantity}
            aria-label="수량 늘리기"
          >
            +
          </button>
        </div>
        <p className="product-detail__stock-hint">
          {isSoldOut ? '품절' : `재고 ${stock.toLocaleString('ko-KR')}개 · 최대 ${maxQuantity}개까지 선택`}
        </p>
      </div>

      {optionError && (
        <p className="product-detail__option-error" role="alert">
          {optionError}
        </p>
      )}
    </section>
  )
}

export default ProductDetailOptions
