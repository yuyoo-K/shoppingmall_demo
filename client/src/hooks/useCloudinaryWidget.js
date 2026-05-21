/**
 * Cloudinary 업로드 위젯 초기화·열기
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { getCloudinaryConfig, isCloudinaryConfigured, loadCloudinaryScript } from '@/utils/cloudinary'
import { IMAGE_MAX_SIZE_MB } from '@/constants/productForm'

export function useCloudinaryWidget({ onSuccess, onError } = {}) {
  const widgetRef = useRef(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const [isReady, setIsReady] = useState(false)
  const [loadError, setLoadError] = useState('')

  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    if (!isCloudinaryConfigured()) {
      setLoadError('Cloudinary 설정이 필요합니다. (.env에 cloud name, upload preset)')
      return undefined
    }

    let cancelled = false

    loadCloudinaryScript()
      .then(() => {
        if (cancelled) return

        const { cloudName, uploadPreset } = getCloudinaryConfig()

        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFiles: 1,
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif'],
            maxFileSize: IMAGE_MAX_SIZE_MB * 1024 * 1024,
            cropping: true,
            croppingAspectRatio: 1,
            showSkipCropButton: true,
            styles: {
              palette: {
                window: '#ffffff',
                windowBorder: '#dee2e6',
                tabIcon: '#868e96',
                menuIcons: '#495057',
                link: '#111111',
                action: '#111111',
                inactiveTabIcon: '#adb5bd',
                error: '#e03131',
                inProgress: '#339af0',
                complete: '#2b8a3e',
                sourceBg: '#f8f9fa',
              },
            },
          },
          (error, result) => {
            if (error) {
              onErrorRef.current?.(error.message || '이미지 업로드에 실패했습니다.')
              return
            }

            if (result?.event === 'success') {
              onSuccessRef.current?.({
                url: result.info.secure_url,
                publicId: result.info.public_id,
                fileName: result.info.original_filename,
              })
            }
          },
        )

        setIsReady(true)
        setLoadError('')
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message)
        }
      })

    return () => {
      cancelled = true
      widgetRef.current?.destroy?.()
      widgetRef.current = null
      setIsReady(false)
    }
  }, [])

  const openWidget = useCallback(() => {
    if (!isCloudinaryConfigured()) {
      onErrorRef.current?.(
        'VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET을 .env에 설정해 주세요.',
      )
      return
    }

    if (loadError) {
      onErrorRef.current?.(loadError)
      return
    }

    if (!widgetRef.current) {
      onErrorRef.current?.('Cloudinary 위젯을 준비하는 중입니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    widgetRef.current.open()
  }, [loadError])

  return {
    openWidget,
    isReady,
    loadError,
    isConfigured: isCloudinaryConfigured(),
  }
}
