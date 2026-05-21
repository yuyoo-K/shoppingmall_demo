/**
 * Cloudinary 업로드 위젯 스크립트 로드 및 환경 변수 확인
 */

const CLOUDINARY_SCRIPT_URL = 'https://upload-widget.cloudinary.com/global/all.js'

let scriptPromise = null

export const getCloudinaryConfig = () => ({
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || '',
})

export const isCloudinaryConfigured = () => {
  const { cloudName, uploadPreset } = getCloudinaryConfig()
  return Boolean(cloudName && uploadPreset)
}

/** 위젯 JS를 동적으로 로드 (중복 로드 방지) */
export const loadCloudinaryScript = () => {
  if (typeof window !== 'undefined' && window.cloudinary?.createUploadWidget) {
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CLOUDINARY_SCRIPT_URL}"]`)

    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Cloudinary 위젯을 불러오지 못했습니다.')))
      return
    }

    const script = document.createElement('script')
    script.src = CLOUDINARY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Cloudinary 위젯을 불러오지 못했습니다.'))
    document.body.appendChild(script)
  })

  return scriptPromise
}
