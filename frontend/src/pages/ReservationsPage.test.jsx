import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import {
  approveReservationRequest,
  cancelReservationRequest,
  completeReservationRequest,
  getReservationsRequest,
  rejectReservationRequest,
  updateReservationDeliveryStatusRequest,
} from '../api/reservations'
import { I18nProvider } from '../contexts/I18nContext'
import ReservationsPage from './ReservationsPage'

vi.mock('../api/reservations', () => ({
  approveReservationRequest: vi.fn(),
  cancelReservationRequest: vi.fn(),
  completeReservationRequest: vi.fn(),
  getReservationsRequest: vi.fn(),
  rejectReservationRequest: vi.fn(),
  updateReservationDeliveryStatusRequest: vi.fn(),
}))

const sellerReservation = {
  id: 7,
  kind: 'product',
  isBuyer: false,
  reservationStatus: 'pending',
  paymentStatus: 'pending',
  paymentMethod: 'cash_on_pickup',
  deliveryMethod: 'delivery',
  deliveryStatus: 'pending',
  quantity: 2,
  totalPrice: 240,
  deliveryFee: 40,
  grandTotal: 280,
  createdAt: '2026-04-07T10:00:00.000Z',
  note: 'Merci de prevenir avant la livraison.',
  buyer: {
    id: 2,
    name: 'Imane Client',
    email: 'imane@yazoo.ma',
  },
  seller: {
    id: 1,
    name: 'Youssef Boutique',
    email: 'youssef@yazoo.ma',
  },
  listing: {
    title: 'Panier velours violet',
    location: 'Marrakech',
    routePath: '/marketplace/products/3',
  },
  delivery: {
    contactName: 'Imane Client',
    phone: '+212600000004',
    city: 'Fes',
    address: 'Avenue Hassan II',
    notes: 'Appeler avant livraison',
  },
  canViewInvoice: false,
  canApprove: true,
  canReject: true,
  canCancel: false,
  canMarkShipped: false,
  canMarkDelivered: false,
  canMarkPickedUp: false,
  canComplete: false,
}

describe('ReservationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn(() => true))
    globalThis.localStorage?.setItem('yazoo-locale', 'fr')

    getReservationsRequest.mockResolvedValue({
      data: {
        buyerReservations: [],
        sellerReservations: [sellerReservation],
      },
    })
    approveReservationRequest.mockResolvedValue({ data: {} })
    rejectReservationRequest.mockResolvedValue({ data: {} })
    cancelReservationRequest.mockResolvedValue({ data: {} })
    completeReservationRequest.mockResolvedValue({ data: {} })
    updateReservationDeliveryStatusRequest.mockResolvedValue({ data: {} })
  })

  it('permet au vendeur d approuver une reservation', async () => {
    const user = userEvent.setup()

    render(
      <I18nProvider>
        <MemoryRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ReservationsPage />
        </MemoryRouter>
      </I18nProvider>,
    )

    await screen.findByRole('heading', { name: 'Centre de commandes' })

    await user.click(await screen.findByRole('button', { name: /Mes ventes \(1\)/ }))
    await user.click(screen.getByRole('button', { name: 'Approuver' }))

    await waitFor(() => {
      expect(globalThis.confirm).toHaveBeenCalled()
      expect(approveReservationRequest).toHaveBeenCalledWith(7)
    })

    expect(await screen.findByText('Reservation approuvee avec succes.')).toBeInTheDocument()
  })
})
