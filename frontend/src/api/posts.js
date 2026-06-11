import api from './client'

export const getPostsRequest = (params = {}) => api.get('/posts', { params })

export const createPostRequest = (payload) => {
  if (!payload.media_file) {
    return api.post('/posts', payload)
  }

  const formData = new FormData()

  formData.append('content', payload.content ?? '')
  if (payload.community_id) {
    formData.append('community_id', payload.community_id)
  }
  if (payload.visibility) {
    formData.append('visibility', payload.visibility)
  }
  formData.append('location', payload.location ?? '')

  ;(payload.tags ?? []).forEach((tag) => {
    formData.append('tags[]', tag)
  })

  formData.append('media_file', payload.media_file)

  return api.post('/posts', formData)
}

export const toggleLikeRequest = (postId, reaction = 'like') =>
  api.post(`/posts/${postId}/like`, { reaction })

export const updatePostRequest = (postId, payload) =>
  api.patch(`/posts/${postId}`, payload)

export const deletePostRequest = (postId) =>
  api.delete(`/posts/${postId}`)

export const createCommentRequest = (postId, payload) =>
  api.post(`/posts/${postId}/comments`, payload)

export const reactToCommentRequest = (commentId, reaction) =>
  api.post(`/comments/${commentId}/reaction`, { reaction })
