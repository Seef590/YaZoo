import api from './client'

export function getConversationsRequest() {
  return api.get('/conversations')
}

export function createConversationRequest(payload) {
  return api.post('/conversations', payload)
}

export function getConversationRequest(conversationId) {
  return api.get(`/conversations/${conversationId}`)
}

export function createMessageRequest(conversationId, payload) {
  return api.post(`/conversations/${conversationId}/messages`, payload)
}
