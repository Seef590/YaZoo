import api from './client'
import { getBackendBaseUrl } from '../lib/appConfig'

export const loginRequest = (payload) => api.post('/auth/login', payload)

export const registerRequest = (payload) => api.post('/auth/register', payload)

export const logoutRequest = () => api.post('/auth/logout')

export const meRequest = () => api.get('/auth/me')

export const getGoogleAuthUrl = () => `${getBackendBaseUrl()}/api/auth/google`
