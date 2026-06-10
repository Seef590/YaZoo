import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '../api/auth'
import { AUTH_SESSION_EXPIRED_EVENT, ensureCsrfCookie } from '../api/client'
import { setMonitoringUser } from '../lib/monitoring'
import { disconnectRealtime } from '../lib/realtime'
import { normalizeAuthUserMedia } from '../utils/media'
import { AuthContext } from './auth-context'

const DEVICE_NAME = 'yazoo-web'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        await ensureCsrfCookie()
        const response = await meRequest()

        if (!cancelled) {
          setUser(normalizeAuthUserMedia(response.data.user))
          setIsAuthenticated(true)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null)
      setIsAuthenticated(false)
    }

    globalThis.addEventListener?.(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      globalThis.removeEventListener?.(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [])

  useEffect(() => {
    setMonitoringUser(user)

    if (!user) {
      disconnectRealtime()
    }
  }, [user])

  const login = async ({ email, password }) => {
    const response = await loginRequest({
      email,
      password,
      device_name: DEVICE_NAME,
    })

    setUser(normalizeAuthUserMedia(response.data.user))
    setIsAuthenticated(true)

    return response.data
  }

  const register = async (payload) => {
    const response = await registerRequest({
      ...payload,
      device_name: DEVICE_NAME,
    })

    setUser(normalizeAuthUserMedia(response.data.user))
    setIsAuthenticated(true)

    return response.data
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        isAuthenticated,
        isBootstrapping,
        login,
        logout,
        register,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
