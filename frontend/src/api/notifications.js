import api from './client'

export function getNotificationsRequest() {
  return api.get('/notifications')
}

export function getUnreadNotificationsCountRequest() {
  return api.get('/notifications/unread-count')
}

export function markNotificationReadRequest(notificationId) {
  return api.post(`/notifications/${notificationId}/read`)
}

export function markAllNotificationsReadRequest() {
  return api.post('/notifications/read-all')
}
