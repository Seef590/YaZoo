import axios from 'axios'

import { getApiBaseUrl } from '../../lib/appConfig'
import { getCurrentLocale } from '../../lib/i18n'

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete config.headers['Content-Type']
    }
  }

  const locale = getCurrentLocale()

  if (typeof config.headers?.set === 'function') {
    config.headers.set('Accept-Language', locale)
  } else {
    config.headers = {
      ...(config.headers ?? {}),
      'Accept-Language': locale,
    }
  }

  return config
})
