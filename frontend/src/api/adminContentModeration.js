import api from './client'

export const updateAdminContentModerationStatusRequest = (type, id, payload) =>
  api.patch(`/admin/content/${type}/${id}/moderation-status`, payload)
