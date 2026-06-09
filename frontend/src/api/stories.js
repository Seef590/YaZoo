import api from './client'

export const getStoriesRequest = (params = {}) => api.get('/stories', { params })

export const markStoryViewedRequest = (storyId) =>
  api.post(`/stories/${storyId}/view`)

export const deleteStoryRequest = (storyId) =>
  api.delete(`/stories/${storyId}`)

export const createStoryRequest = (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    formData.append(key, String(value))
  })

  return api.post('/stories', formData)
}
