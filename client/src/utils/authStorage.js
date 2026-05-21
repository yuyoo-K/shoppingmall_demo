/**
 * localStorage 기반 인증 토큰·사용자 정보 저장
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const saveAuth = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
