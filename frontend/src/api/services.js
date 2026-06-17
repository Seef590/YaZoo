import api from './client'

export const getServicesRequest = (params = {}) => api.get('/services', { params })
export const getServiceRequest = (serviceId) => api.get(`/services/${serviceId}`)
export const getServiceTypesRequest = () => api.get('/services/types')
export const getMyServicesRequest = () => api.get('/my/services')
export const createServiceRequest = (payload) => api.post('/services', payload)
export const updateServiceRequest = (serviceId, payload) => api.patch(`/services/${serviceId}`, payload)
export const deleteServiceRequest = (serviceId) => api.delete(`/services/${serviceId}`)
export const getServiceSuggestionsRequest = () => api.get('/services/feed')
