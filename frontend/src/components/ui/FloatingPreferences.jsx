import { useState } from 'react'

import { useI18n } from '../../hooks/useI18n'
import { useTheme } from '../../hooks/useTheme'

const languageOptions = [
  { value: 'fr', label: 'Francais', shortLabel: 'FR' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'ar', label: 'Arabe', shortLabel: 'AR' },
  { value: 'de', label: 'Deutsch', shortLabel: 'DE' },
]

function FloatingPreferences() {
  const { locale, setLocale } = useI18n()
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const nextTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <div className="fixed bottom-24 right-3 z-40 flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
      {isOpen ? (
        <div className="flex flex-col items-end gap-2 rounded-[26px] border border-white/20 bg-stone-950/88 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-violet-300/20">
          <div className="grid grid-cols-2 gap-2">
            {languageOptions.map((option) => {
              const active = locale === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLocale(option.value)}
                  className={`h-11 w-11 rounded-full border text-[11px] font-bold transition ${
                    active
                      ? 'border-white bg-white text-violet-800 shadow-[0_10px_24px_rgba(168,85,247,0.35)]'
                      : 'border-white/15 bg-white/10 text-white hover:bg-white/18'
                  }`}
                  title={option.label}
                  aria-label={option.label}
                >
                  {option.shortLabel}
                </button>
              )
            })}

            <button
              type="button"
              onClick={toggleTheme}
              className="h-11 w-11 rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white transition hover:bg-white/18"
              title={nextTheme === 'dark' ? 'Mode clair' : 'Mode nuit'}
              aria-label={nextTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode nuit'}
            >
              {nextTheme === 'dark' ? 'SUN' : 'MOON'}
            </button>
          </div>

          <div className="flex gap-1 rounded-full bg-white/8 p-1">
            {['system', 'light', 'dark'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  theme === option
                    ? 'bg-white text-violet-800'
                    : 'text-white/72 hover:bg-white/10 hover:text-white'
                }`}
              >
                {option === 'system' ? 'Auto' : option === 'light' ? 'Jour' : 'Nuit'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="h-12 w-12 rounded-full border border-white/20 bg-white text-lg font-bold text-violet-800 shadow-[0_18px_40px_rgba(124,58,237,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(124,58,237,0.3)] dark:bg-stone-900 dark:text-violet-100"
        aria-expanded={isOpen}
        aria-label="Ouvrir les preferences de langue et theme"
      >
        {isOpen ? 'X' : 'G'}
      </button>
    </div>
  )
}

export default FloatingPreferences
