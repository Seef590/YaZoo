import api from './client'

export const getReservationsRequest = () => api.get('/reservations')
export const getOrdersHistoryRequest = () => api.get('/orders/history')
export const getReservationInvoiceRequest = (reservationId) =>
  api.get(`/reservations/${reservationId}/invoice`)

export const createAnimalReservationRequest = (animalId, payload) =>
  api.post(`/animals/${animalId}/reservations`, payload)

export const createProductReservationRequest = (productId, payload) =>
  api.post(`/products/${productId}/reservations`, payload)

export const createReservationRequest = (payload) =>
  api.post('/reservations', payload)

export const approveReservationRequest = (reservationId) =>
  api.post(`/reservations/${reservationId}/approve`)

export const rejectReservationRequest = (reservationId) =>
  api.post(`/reservations/${reservationId}/reject`)

export const updateReservationDeliveryStatusRequest = (reservationId, payload) =>
  api.patch(`/reservations/${reservationId}/delivery-status`, payload)

export const cancelReservationRequest = (reservationId) =>
  api.post(`/reservations/${reservationId}/cancel`)

export const completeReservationRequest = (reservationId) =>
  api.post(`/reservations/${reservationId}/complete`)
