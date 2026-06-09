import api from './client'

export const loginRequest = (payload) => api.post('/auth/login', payload)

export const registerRequest = (payload) => api.post('/auth/register', payload)

export const logoutRequest = () => api.post('/auth/logout')

export const meRequest = () => api.get('/auth/me')
