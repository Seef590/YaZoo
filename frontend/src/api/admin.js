import api from './client'

export const getAdminOrdersDashboardRequest = () => api.get('/admin/orders')

export const getAdminModerationRequest = () => api.get('/admin/moderation')

export const deleteAdminPostRequest = (postId) => api.delete(`/admin/posts/${postId}`)

export const deleteAdminAnimalRequest = (animalId) =>
  api.delete(`/admin/animals/${animalId}`)

export const deleteAdminProductRequest = (productId) =>
  api.delete(`/admin/products/${productId}`)

export const deleteAdminCommunityRequest = (communityId) =>
  api.delete(`/admin/communities/${communityId}`)
