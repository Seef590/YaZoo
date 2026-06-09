import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { loginRequest, logoutRequest, meRequest } from '../api/auth'
import { AuthProvider } from './AuthContext.jsx'
import { useAuth } from '../hooks/useAuth'

vi.mock('../api/auth', () => ({
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  meRequest: vi.fn(),
  registerRequest: vi.fn(),
}))

function AuthHarness() {
  const { isAuthenticated, isBootstrapping, login, logout, user } = useAuth()

  if (isBootstrapping) {
    return <p>Bootstrapping</p>
  }

  return (
    <div>
      <p>{isAuthenticated ? 'connecte' : 'deconnecte'}</p>
      <p>{user?.name ?? 'Anonyme'}</p>
      <button
        type="button"
        onClick={() => login({ email: 'sara@yazoo.ma', password: 'secret123' })}
      >
        Login
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('restaure une session existante au bootstrap', async () => {
    meRequest.mockResolvedValueOnce({
      data: {
        user: { id: 1, name: 'Sara Adoption' },
      },
    })

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    expect(await screen.findByText('connecte')).toBeInTheDocument()
    expect(screen.getByText('Sara Adoption')).toBeInTheDocument()
  })

  it('met a jour l etat apres login puis logout', async () => {
    const user = userEvent.setup()

    meRequest.mockRejectedValueOnce(new Error('no session'))
    loginRequest.mockResolvedValueOnce({
      data: {
        user: { id: 2, name: 'Imane Client' },
      },
    })
    logoutRequest.mockResolvedValueOnce({
      data: {
        message: 'Deconnexion reussie.',
      },
    })

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    )

    expect(await screen.findByText('deconnecte')).toBeInTheDocument()
    expect(screen.getByText('Anonyme')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(loginRequest).toHaveBeenCalledWith({
      email: 'sara@yazoo.ma',
      password: 'secret123',
      device_name: 'yazoo-web',
    })

    expect(await screen.findByText('connecte')).toBeInTheDocument()
    expect(screen.getByText('Imane Client')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(logoutRequest).toHaveBeenCalledTimes(1)
      expect(screen.getByText('deconnecte')).toBeInTheDocument()
      expect(screen.getByText('Anonyme')).toBeInTheDocument()
    })
  })
})
