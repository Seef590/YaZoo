import api from './client'

export const getProductsRequest = (params = {}) =>
  api.get('/products', { params })

export const getProductRequest = (productId) => api.get(`/products/${productId}`)

export const createProductRequest = (payload) => api.post('/products', payload)

export const updateProductRequest = (productId, payload) => {
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    payload.append('_method', 'PUT')

    return api.post(`/products/${productId}`, payload)
  }

  return api.put(`/products/${productId}`, payload)
}

export const deleteProductRequest = (productId) =>
  api.delete(`/products/${productId}`)
