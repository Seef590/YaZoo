import api from './client'

export const getAdminModerationActionsRequest = (params = {}) =>
  api.get('/admin/moderation-actions', { params })
