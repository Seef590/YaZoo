import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { I18nContext } from './i18n-context'
import { getCurrentLocale, getDirection, setStoredLocale, translate } from '../lib/i18n'

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => getCurrentLocale())

  useEffect(() => {
    const nextDirection = getDirection(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = nextDirection
    document.body.dir = nextDirection
    setStoredLocale(locale)
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      dir: getDirection(locale),
      isRtl: locale === 'ar',
      setLocale: (nextLocale) => {
        setLocaleState(nextLocale)
      },
      t: (key, replacements = {}) => translate(locale, key, replacements),
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

I18nProvider.propTypes = {
  children: PropTypes.node,
}
