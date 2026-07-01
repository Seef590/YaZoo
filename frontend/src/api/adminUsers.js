import api from './client'

export const getAdminUsersRequest = (params = {}) =>
  api.get('/admin/users', { params })

export const updateAdminUserSuspensionRequest = (userId, payload) =>
  api.patch(`/admin/users/${userId}/suspension`, payload)

export const updateAdminUserBanRequest = (userId, payload) =>
  api.patch(`/admin/users/${userId}/ban`, payload)
