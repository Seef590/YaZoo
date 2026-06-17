import api from './client'

export const getProfileRequest = (userId) => api.get(`/users/${userId}`)

export const getUserSuggestionsRequest = () => api.get('/users/suggestions')

export const followUserRequest = (userId) => api.post(`/users/${userId}/follow`)

export const unfollowUserRequest = (userId) => api.delete(`/users/${userId}/follow`)

export const updateProfileRequest = (userId, payload) => {
  const hasFiles = Boolean(payload.avatar_file || payload.cover_photo_file)

  if (!hasFiles) {
    return api.patch(`/users/${userId}`, payload)
  }

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')
      return
    }

    formData.append(key, String(value))
  })

  formData.append('_method', 'PATCH')

  return api.post(`/users/${userId}`, formData)
}
