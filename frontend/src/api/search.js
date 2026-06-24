import api from './client'

export function searchUsersRequest(query) {
  return api.get('/search/users', {
    params: { q: query },
    skipGlobalErrorToast: true,
  })
}

export function globalSearchRequest(query, type = 'all') {
  return api.get('/search', {
    params: { q: query, type },
    skipGlobalErrorToast: true,
  })
}
