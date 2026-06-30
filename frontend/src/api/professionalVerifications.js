import api from './client'

export const createProfessionalVerificationRequest = (payload) =>
  api.post('/professional-verifications', payload)

export const getMyProfessionalVerificationsRequest = () =>
  api.get('/professional-verifications/me')

export const getAdminProfessionalVerificationsRequest = (params = {}) =>
  api.get('/admin/professional-verifications', { params })

export const updateAdminProfessionalVerificationStatusRequest = (verificationId, payload) =>
  api.patch(`/admin/professional-verifications/${verificationId}/status`, payload)
