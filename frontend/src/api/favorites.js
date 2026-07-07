import api from './client'

export const getFavoritesRequest = (params = {}) => api.get('/favorites', { params })

export const saveFavoriteRequest = ({ type, id }) =>
  api.post('/favorites', { type, id })

export const removeFavoriteRequest = ({ type, id }) =>
  api.delete(`/favorites/${type}/${id}`)
