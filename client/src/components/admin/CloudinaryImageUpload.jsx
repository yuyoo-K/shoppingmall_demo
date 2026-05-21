/** 상품 이미지 Cloudinary 업로드 UI */
import { useCallback } from 'react'
import { IMAGE_MAX_SIZE_MB } from '@/constants/productForm'
import { useCloudinaryWidget } from '@/hooks/useCloudinaryWidget'

function CloudinaryImageUpload({ imageUrl, fileName, onChange, onError }) {
  const handleSuccess = useCallback(
    ({ url, fileName: uploadedName }) => {
      onChange(url, uploadedName)
    },
    [onChange],
  )

  const { openWidget, isReady, loadError, isConfigured } = useCloudinaryWidget({
    onSuccess: handleSuccess,
    onError,
  })

  const handleOpen = () => {
    openWidget()
  }

  const handleRemove = () => {
    onChange('', '')
  }

  return (
    <div className="product-register__field product-register__field--image">
      {imageUrl ? (
        <div className="product-register__preview-wrap">
          <button
            type="button"
            className="product-register__upload product-register__upload--filled"
            onClick={handleOpen}
            disabled={!isConfigured}
          >
            <img src={imageUrl} alt="업로드된 상품 이미지 미리보기" className="product-register__preview" />
          </button>
          <button type="button" className="product-register__remove-image" onClick={handleRemove}>
            삭제
          </button>
        </div>
      ) : (
        <button
          id="product-image-upload"
          type="button"
          className="product-register__upload"
          onClick={handleOpen}
          disabled={!isConfigured || (!isReady && !loadError)}
        >
          <span className="product-register__upload-icon">+</span>
          <span className="product-register__upload-text">
            {isReady ? '업로드' : '준비 중…'}
          </span>
        </button>
      )}
      <div className="product-register__image-hint">
        <p>Cloudinary 위젯으로 업로드</p>
        <p>권장 크기: 300x300 (1:1 자르기 지원)</p>
        <p>용량: {IMAGE_MAX_SIZE_MB}MB 이하 · PNG, JPG, GIF</p>
        {fileName && <p className="product-register__file-name">{fileName}</p>}
        {!isConfigured && (
          <p className="product-register__image-warning">
            .env에 VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET을 설정해 주세요.
          </p>
        )}
        {loadError && <p className="product-register__image-warning">{loadError}</p>}
      </div>
    </div>
  )
}

export default CloudinaryImageUpload
