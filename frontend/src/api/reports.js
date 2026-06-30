import api from './client'

export const createReportRequest = (payload) => api.post('/reports', payload)

export const getAdminReportsRequest = (params = {}) =>
  api.get('/admin/reports', { params })

export const updateAdminReportStatusRequest = (reportId, status) =>
  api.patch(`/admin/reports/${reportId}/status`, { status })
