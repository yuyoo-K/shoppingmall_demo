/**
 * 공통 Axios 인스턴스
 * - /api 프록시, JWT 자동 첨부, 에러 메시지 한국어 변환
 */
import axios from 'axios'
import { clearAuth } from '@/utils/authStorage'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** 요청 시 localStorage 토큰을 Authorization 헤더에 추가 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/** Axios/HTTP 기본 영문 메시지를 한국어로 치환 */
const translateErrorMessage = (message, status) => {
  const messageMap = {
    'Network Error': '네트워크 오류가 발생했습니다. 서버 연결을 확인해 주세요.',
    'timeout of 10000ms exceeded': '요청 시간이 초과되었습니다.',
    'Request failed with status code 404': '요청한 API를 찾을 수 없습니다.',
    'Request failed with status code 500': '서버 내부 오류가 발생했습니다.',
  }

  if (status === 401) {
    return message || '이메일 또는 비밀번호가 올바르지 않습니다.'
  }

  return messageMap[message] || message
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // 로그인 요청이 아닌 401이면 저장된 인증 정보 제거
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      clearAuth()
    }

    const message = translateErrorMessage(
      error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.',
      status,
    )

    return Promise.reject(new Error(message))
  },
)

export default api
