/** 상품 API */
import api from '@/api/axios'

export const getProducts = async (params) => {
  const { data } = await api.get('/products', { params })
  return data
}

/** 페이지네이션 없이 전체 목록 (홈 등) */
export const getAllProducts = async (params) => {
  const { data } = await api.get('/products', { params: { ...params, all: true } })
  return data
}

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload)
  return data
}

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}
