import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Layout from './Layout'
import { I18nProvider } from '../contexts/I18nContext'
import { getConversationsRequest, getUnreadMessagesCountRequest } from '../api/messages'
import { getNotificationsRequest, markNotificationReadRequest } from '../api/notifications'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isBootstrapping: false,
    logout: vi.fn(),
    user: { id: 1, name: 'Admin YaZoo', isAdmin: true },
  }),
}))

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({
    latestNotification: { id: 99, type: 'new_message' },
    refreshUnreadCount: vi.fn(),
    unreadCount: 1,
  }),
}))

vi.mock('../api/messages', () => ({
  getConversationsRequest: vi.fn(),
  getUnreadMessagesCountRequest: vi.fn(),
}))

vi.mock('../api/notifications', () => ({
  getNotificationsRequest: vi.fn(),
  markAllNotificationsReadRequest: vi.fn(),
  markNotificationReadRequest: vi.fn(),
}))

vi.mock('../api/search', () => ({
  searchUsersRequest: vi.fn().mockResolvedValue({ data: { data: [] } }),
}))

function renderLayout() {
  localStorage.setItem('yazoo-locale', 'fr')

  return render(
    <MemoryRouter initialEntries={['/feed']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/feed" element={<p>Feed content</p>} />
            <Route path="/notifications" element={<p>Notifications content</p>} />
          </Route>
        </Routes>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUnreadMessagesCountRequest.mockResolvedValue({ data: { data: { unreadCount: 2 } } })
    getConversationsRequest.mockResolvedValue({ data: { data: [] } })
    getNotificationsRequest.mockResolvedValue({
      data: {
        data: [
          {
            id: 7,
            type: 'report_status',
            title: 'Signalement',
            body: 'Statut mis a jour',
            actionUrl: '/notifications',
            isRead: false,
            createdAt: '2026-07-01T10:00:00.000Z',
            meta: {},
          },
        ],
      },
    })
    markNotificationReadRequest.mockResolvedValue({ data: {} })
  })

  it('rafraichit les messages et charge les apercus sans void', async () => {
    const user = userEvent.setup()

    renderLayout()

    await waitFor(() => {
      expect(getUnreadMessagesCountRequest).toHaveBeenCalled()
    })

    await user.click(screen.getByRole('button', { name: 'Messages' }))

    await waitFor(() => {
      expect(getConversationsRequest).toHaveBeenCalled()
    })
  })

  it('marque une notification comme lue depuis le menu', async () => {
    const user = userEvent.setup()

    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    await user.click(await screen.findByRole('link', { name: /Signalement/i }))

    expect(markNotificationReadRequest).toHaveBeenCalledWith(7)
  })
})
