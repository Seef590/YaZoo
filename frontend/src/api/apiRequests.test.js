import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './client'
import { loginRequest, logoutRequest, meRequest, registerRequest } from './auth'
import {
  approveReservationRequest,
  cancelReservationRequest,
  completeReservationRequest,
  createAnimalReservationRequest,
  createProductReservationRequest,
  getOrdersHistoryRequest,
  getReservationInvoiceRequest,
  getReservationsRequest,
  rejectReservationRequest,
  updateReservationDeliveryStatusRequest,
} from './reservations'
import {
  createStoryRequest,
  deleteStoryRequest,
  getStoriesRequest,
  markStoryViewedRequest,
} from './stories'

vi.mock('./client', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

describe('api request wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('appelle les endpoints auth', () => {
    loginRequest({ email: 'a@yazoo.app' })
    registerRequest({ name: 'Sara' })
    logoutRequest()
    meRequest()

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@yazoo.app' })
    expect(api.post).toHaveBeenCalledWith('/auth/register', { name: 'Sara' })
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  it('appelle les endpoints reservations avec PATCH pour la livraison', () => {
    getReservationsRequest()
    getOrdersHistoryRequest()
    getReservationInvoiceRequest(4)
    createAnimalReservationRequest(7, { delivery_method: 'pickup' })
    createProductReservationRequest(8, { quantity: 2 })
    approveReservationRequest(9)
    rejectReservationRequest(9)
    cancelReservationRequest(9)
    completeReservationRequest(9)
    updateReservationDeliveryStatusRequest(9, { delivery_status: 'shipped' })

    expect(api.get).toHaveBeenCalledWith('/reservations')
    expect(api.get).toHaveBeenCalledWith('/orders/history')
    expect(api.get).toHaveBeenCalledWith('/reservations/4/invoice')
    expect(api.post).toHaveBeenCalledWith('/animals/7/reservations', { delivery_method: 'pickup' })
    expect(api.post).toHaveBeenCalledWith('/products/8/reservations', { quantity: 2 })
    expect(api.post).toHaveBeenCalledWith('/reservations/9/approve')
    expect(api.post).toHaveBeenCalledWith('/reservations/9/reject')
    expect(api.post).toHaveBeenCalledWith('/reservations/9/cancel')
    expect(api.post).toHaveBeenCalledWith('/reservations/9/complete')
    expect(api.patch).toHaveBeenCalledWith('/reservations/9/delivery-status', { delivery_status: 'shipped' })
  })

  it('appelle les endpoints stories avec pagination et FormData', () => {
    const media = new File(['story'], 'story.webp', { type: 'image/webp' })

    getStoriesRequest({ page: 2 })
    markStoryViewedRequest(3)
    deleteStoryRequest(4)
    createStoryRequest({
      content: 'Bonjour',
      location: '',
      media_file: media,
      ignored: null,
    })

    expect(api.get).toHaveBeenCalledWith('/stories', { params: { page: 2 } })
    expect(api.post).toHaveBeenCalledWith('/stories/3/view')
    expect(api.delete).toHaveBeenCalledWith('/stories/4')

    const formData = api.post.mock.calls.find(([url]) => url === '/stories')[1]

    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('content')).toBe('Bonjour')
    expect(formData.get('media_file')).toBe(media)
    expect(formData.has('location')).toBe(false)
    expect(formData.has('ignored')).toBe(false)
  })
})
