import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { I18nContext } from './i18n-context'

const DEVICE_NAME = 'yazoo-web'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const i18n = useContext(I18nContext)
  const setLocale = useMemo(() => i18n?.setLocale ?? (() => {}), [i18n?.setLocale])
  const authRevision = useRef(0)

  const applyAuthenticatedUser = useCallback((nextUser) => {
    const normalizedUser = normalizeAuthUserMedia(nextUser)

    setUser(normalizedUser)

    if (normalizedUser?.preferredLocale) {
      setLocale(normalizedUser.preferredLocale)
    }
  }, [setLocale])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const revisionAtStart = authRevision.current
        await ensureCsrfCookie()
        const response = await meRequest()

        if (!cancelled && authRevision.current === revisionAtStart) {
          applyAuthenticatedUser(response.data.user)
          setIsAuthenticated(true)
        }
      } catch {
        if (!cancelled && authRevision.current === 0) {
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
  }, [applyAuthenticatedUser])

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

    authRevision.current += 1
    applyAuthenticatedUser(response.data.user)
    setIsAuthenticated(true)

    return response.data
  }

  const register = async (payload) => {
    const response = await registerRequest({
      ...payload,
      device_name: DEVICE_NAME,
    })

    authRevision.current += 1
    applyAuthenticatedUser(response.data.user)
    setIsAuthenticated(true)

    return response.data
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      authRevision.current += 1
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
