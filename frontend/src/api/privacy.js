import api from './client'

export const createPublicPrivacyConsent = (payload) =>
  api.post('/privacy/consents/public', payload, { skipGlobalErrorToast: true })

export const createPrivacyConsent = (payload) =>
  api.post('/privacy/consents', payload, { skipGlobalErrorToast: true })

export const getPrivacyConsents = () => api.get('/privacy/consents')

export const exportPrivacyData = () => api.get('/privacy/export')

export const createDataDeletionRequest = (payload) =>
  api.post('/privacy/delete-request', payload)

export const getDataDeletionRequest = () => api.get('/privacy/delete-request')
