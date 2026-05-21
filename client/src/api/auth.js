/** 인증 API (로그인, 내 정보) */
import api from './axios'

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}
