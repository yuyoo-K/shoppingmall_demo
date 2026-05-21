/** 상품 등록·수정 모달 (Cloudinary 이미지 업로드) */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createProduct, updateProduct } from '@/api/products'
import CloudinaryImageUpload from '@/components/admin/CloudinaryImageUpload'
import {
  INITIAL_PRODUCT_FORM,
  mapCategoryValueToPayload,
  NAME_MAX_LENGTH,
  PRODUCT_CATEGORY_OPTIONS,
  productToFormState,
  SKU_MAX_LENGTH,
} from '@/constants/productForm'

function ProductRegisterModal({ mode = 'create', product = null, onClose, onSuccess }) {
  const isEdit = mode === 'edit'
  const formId = useId()
  const panelRef = useRef(null)

  const [form, setForm] = useState(INITIAL_PRODUCT_FORM)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (isEdit && product) {
      const nextForm = productToFormState(product)
      setForm(nextForm)
      setImagePreview(nextForm.image)
      setImageFileName('')
    } else {
      setForm(INITIAL_PRODUCT_FORM)
      setImagePreview('')
      setImageFileName('')
    }
    setError('')
  }, [isEdit, product])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleImageChange = useCallback((url, name = '') => {
    setForm((prev) => ({ ...prev, image: url }))
    setImagePreview(url)
    setImageFileName(name)
    setError('')
  }, [])

  const handleImageError = useCallback((message) => {
    setError(message)
  }, [])

  const validate = () => {
    if (!form.image) return '상품 이미지를 등록해 주세요.'
    if (!form.sku.trim()) return '자체 상품 코드(SKU)를 입력해 주세요.'
    if (!form.name.trim()) return '상품명을 입력해 주세요.'
    if (!form.category) return '카테고리를 선택해 주세요.'
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      return '상품 가격을 올바르게 입력해 주세요.'
    }
    return ''
  }

  const buildPayload = () => ({
    sku: form.sku.trim(),
    name: form.name.trim(),
    price: Number(form.price),
    category: mapCategoryValueToPayload(form.category),
    image: form.image,
    description: form.description.trim(),
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (isEdit) {
        await updateProduct(product._id, buildPayload())
      } else {
        await createProduct(buildPayload())
      }
      onSuccess?.()
      onClose()
    } catch (submitError) {
      setError(
        submitError.message ||
          (isEdit ? '상품 수정에 실패했습니다.' : '상품 등록에 실패했습니다.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = isEdit ? '상품 수정' : '상품 등록'
  const submitLabel = isSubmitting
    ? isEdit
      ? '수정 중…'
      : '등록 중…'
    : isEdit
      ? '수정 완료'
      : '확인'

  return createPortal(
    <div className="product-register-modal" role="presentation">
      <div className="product-register-modal__backdrop" aria-hidden="true" />
      <div
        ref={panelRef}
        className="product-register-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-register-title"
        tabIndex={-1}
      >
        <div className="product-register">
          <header className="product-register__header">
            <h1 id="product-register-title" className="product-register__title">
              {title}
            </h1>
            <button type="button" className="product-register__close" onClick={onClose} aria-label="닫기">
              ×
            </button>
          </header>

          <form id={formId} className="product-register__form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="product-register__error" role="alert">
                {error}
              </p>
            )}
            <div className="product-register__row">
              <label className="product-register__label" htmlFor="product-image-upload">
                상품 이미지 <span className="product-register__required">*</span>
              </label>
              <CloudinaryImageUpload
                imageUrl={imagePreview}
                fileName={imageFileName}
                onChange={handleImageChange}
                onError={handleImageError}
              />
            </div>

            <div className="product-register__row">
              <label className="product-register__label" htmlFor="sku">
                자체 상품 코드 <span className="product-register__required">*</span>
              </label>
              <div className="product-register__field">
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  className="product-register__input"
                  placeholder="자체 상품 코드를 입력하세요."
                  value={form.sku}
                  maxLength={SKU_MAX_LENGTH}
                  onChange={handleChange}
                  readOnly={isEdit}
                />
                <span className="product-register__counter">
                  {form.sku.length}/{SKU_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="product-register__row">
              <label className="product-register__label" htmlFor="name">
                상품명 <span className="product-register__required">*</span>
              </label>
              <div className="product-register__field">
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="product-register__input"
                  placeholder="상품명을 입력하세요."
                  value={form.name}
                  maxLength={NAME_MAX_LENGTH}
                  onChange={handleChange}
                />
                <span className="product-register__counter">
                  {form.name.length}/{NAME_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="product-register__row">
              <label className="product-register__label" htmlFor="category">
                카테고리 <span className="product-register__required">*</span>
              </label>
              <div className="product-register__field">
                <select
                  id="category"
                  name="category"
                  className="product-register__select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">카테고리를 선택하세요</option>
                  {PRODUCT_CATEGORY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="product-register__row">
              <label className="product-register__label" htmlFor="price">
                상품 가격 <span className="product-register__required">*</span>
              </label>
              <div className="product-register__field product-register__field--price">
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  className="product-register__input product-register__input--price"
                  placeholder="0"
                  value={form.price}
                  onChange={handleChange}
                />
                <span className="product-register__unit">원</span>
              </div>
            </div>

            <div className="product-register__row product-register__row--textarea">
              <label className="product-register__label" htmlFor="description">
                상품 설명
              </label>
              <div className="product-register__field">
                <textarea
                  id="description"
                  name="description"
                  className="product-register__textarea"
                  placeholder="상품 설명을 입력하세요."
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>

          <footer className="product-register__footer">
            <button type="button" className="product-register__btn product-register__btn--cancel" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              form={formId}
              className="product-register__btn product-register__btn--submit"
              disabled={isSubmitting}
            >
              {submitLabel}
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ProductRegisterModal
