import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { createPublicPrivacyConsent } from '../../api/privacy'
import { useI18n } from '../../hooks/useI18n'

const STORAGE_KEY = 'yazoo-cookie-consent'

function CookieConsentBanner() {
  const { locale, t } = useI18n()
  const [isVisible, setIsVisible] = useState(
    () => !globalThis.localStorage?.getItem(STORAGE_KEY),
  )
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false)

  const choices = useMemo(
    () => ({
      cookies_necessary: true,
      cookies_analytics: analyticsAccepted,
    }),
    [analyticsAccepted],
  )

  if (!isVisible) {
    return null
  }

  const saveChoice = async (nextAnalyticsAccepted) => {
    const payload = {
      cookies_necessary: true,
      cookies_analytics: nextAnalyticsAccepted,
      savedAt: new Date().toISOString(),
    }

    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload))
    setIsVisible(false)

    try {
      await Promise.all([
        createPublicPrivacyConsent({
          type: 'cookies_necessary',
          accepted: true,
          locale,
        }),
        createPublicPrivacyConsent({
          type: 'cookies_analytics',
          accepted: nextAnalyticsAccepted,
          locale,
        }),
      ])
    } catch {
      // Cookie choices are kept locally even if the API is temporarily unavailable.
    }
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-[26px] border border-violet-100/80 bg-white/96 p-4 text-start shadow-[0_24px_70px_rgba(35,13,68,0.22)] backdrop-blur-2xl dark:border-violet-300/16 dark:bg-[#140b22]/96 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-200">
            {t('privacy.cookies.eyebrow')}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-stone-950 dark:text-violet-50">
            {t('privacy.cookies.title')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-violet-100/78">
            {t('privacy.cookies.description')}
          </p>

          {isCustomizing ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ConsentLine
                checked
                disabled
                label={t('privacy.cookies.necessary')}
                description={t('privacy.cookies.necessaryDescription')}
              />
              <ConsentLine
                checked={choices.cookies_analytics}
                label={t('privacy.cookies.analytics')}
                description={t('privacy.cookies.analyticsDescription')}
                onChange={setAnalyticsAccepted}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => saveChoice(false)}
            className="rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-50 dark:border-violet-300/16 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12"
          >
            {t('privacy.cookies.acceptNecessary')}
          </button>
          <button
            type="button"
            onClick={() => setIsCustomizing((current) => !current)}
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-300/18 dark:bg-amber-400/10 dark:text-amber-100"
          >
            {t('privacy.cookies.customize')}
          </button>
          <button
            type="button"
            onClick={() => saveChoice(true)}
            className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(124,58,237,0.18)]"
          >
            {t('privacy.cookies.acceptAll')}
          </button>
          {isCustomizing ? (
            <button
              type="button"
              onClick={() => saveChoice(analyticsAccepted)}
              className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 dark:bg-white/10 dark:text-violet-50 dark:hover:bg-white/14"
            >
              {t('common.save')}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ConsentLine({ checked, description, disabled = false, label, onChange }) {
  return (
    <label className="flex min-w-0 gap-3 rounded-[20px] border border-violet-100 bg-violet-50/60 p-3 dark:border-violet-300/14 dark:bg-white/8">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-700 focus:ring-violet-500"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-stone-900 dark:text-violet-50">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-stone-600 dark:text-violet-100/70">
          {description}
        </span>
      </span>
    </label>
  )
}

ConsentLine.propTypes = {
  checked: PropTypes.bool,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
}

export default CookieConsentBanner
