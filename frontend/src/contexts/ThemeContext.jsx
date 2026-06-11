import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { ThemeContext } from './theme-context'

const THEME_STORAGE_KEY = 'yazoo-theme'
const THEME_OPTIONS = ['system', 'light', 'dark']

function getStoredTheme() {
  if (typeof globalThis.localStorage === 'undefined') {
    return 'system'
  }

  const storedTheme = globalThis.localStorage.getItem(THEME_STORAGE_KEY)

  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : 'system'
}

function getSystemPrefersDark() {
  return Boolean(globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => getSystemPrefersDark())
  const resolvedTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)')

    if (!mediaQuery) {
      return undefined
    }

    const handleChange = (event) => {
      setSystemPrefersDark(event.matches)
    }

    mediaQuery.addEventListener?.('change', handleChange)
    mediaQuery.addListener?.(handleChange)

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange)
      mediaQuery.removeListener?.(handleChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.dataset.theme = theme
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme)
  }, [resolvedTheme, theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      setTheme,
      toggleTheme: () => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
      },
    }),
    [resolvedTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
}
