/** 삭제 등 확인용 모달 */
import { createPortal } from 'react-dom'

function ProductConfirmModal({
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isLoading = false,
  onConfirm,
  onClose,
}) {
  return createPortal(
    <div className="product-confirm-modal" role="presentation">
      <div className="product-register-modal__backdrop" aria-hidden="true" />
      <div
        className="product-confirm-modal__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-confirm-title"
        aria-describedby="product-confirm-message"
      >
        <h2 id="product-confirm-title" className="product-confirm-modal__title">
          {title}
        </h2>
        <p id="product-confirm-message" className="product-confirm-modal__message">
          {message}
        </p>
        <footer className="product-confirm-modal__footer">
          <button
            type="button"
            className="product-register__btn product-register__btn--cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="product-register__btn product-register__btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '처리 중…' : confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export default ProductConfirmModal
