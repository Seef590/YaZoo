import axios from 'axios'

import { getErrorMessage } from '../utils/getErrorMessage'
import { getApiBaseUrl } from '../lib/appConfig'
import { getCurrentSocketId } from '../lib/realtime'
import { emitErrorToast } from '../lib/toastBus'

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  const socketId = getCurrentSocketId()

  if (socketId) {
    if (typeof config.headers?.set === 'function') {
      config.headers.set('X-Socket-ID', socketId)
    } else {
      config.headers = {
        ...(config.headers ?? {}),
        'X-Socket-ID': socketId,
      }
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldShowGlobalErrorToast(error)) {
      emitErrorToast(
        getErrorMessage(error, getGlobalFallbackMessage(error?.response?.status)),
      )
    }

    return Promise.reject(error)
  },
)

function shouldShowGlobalErrorToast(error) {
  if (error?.config?.skipGlobalErrorToast) {
    return false
  }

  const status = error?.response?.status
  const requestUrl = String(error?.config?.url ?? '')

  if (!status) {
    return true
  }

  if (status === 401) {
    return !['/auth/login', '/auth/register', '/auth/me'].some((segment) =>
      requestUrl.includes(segment),
    )
  }

  return status === 429 || status >= 500
}

function getGlobalFallbackMessage(status) {
  if (status === 401) {
    return 'Votre session a expire. Reconnectez-vous pour continuer.'
  }

  if (status === 429) {
    return 'Trop de requetes ont ete envoyees. Reessayez dans quelques instants.'
  }

  if (status && status >= 500) {
    return 'Le serveur rencontre un probleme temporaire.'
  }

  return 'Impossible de joindre le serveur pour le moment.'
}

export default api
