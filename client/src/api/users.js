/** 사용자 API */
import api from './axios'

export const getUsers = async () => {
  const { data } = await api.get('/users')
  return data
}

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload)
  return data
}
