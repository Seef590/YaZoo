import { useI18n } from '../../hooks/useI18n'

function LanguageSwitcher({ className = '', compact = false }) {
  const { locale, setLocale, t } = useI18n()

  const options = [
    { value: 'fr', label: t('common.french'), shortLabel: 'FR' },
    { value: 'en', label: t('common.english'), shortLabel: 'EN' },
    { value: 'ar', label: t('common.arabic'), shortLabel: 'AR' },
    { value: 'de', label: t('common.german'), shortLabel: 'DE' },
  ]

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/32 p-1 shadow-[0_10px_24px_rgba(124,58,237,0.08)] backdrop-blur-xl ${className}`}
      aria-label={t('common.chooseLanguage')}
    >
      {!compact ? (
        <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
          {t('common.language')}
        </span>
      ) : null}

      {options.map((option) => {
        const active = locale === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_10px_20px_rgba(124,58,237,0.14)]'
                : 'text-stone-600 hover:bg-violet-50 hover:text-violet-900 dark:text-violet-100 dark:hover:bg-violet-400/15 dark:hover:text-white'
            }`}
            title={option.label}
          >
            {compact ? option.shortLabel : option.label}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitcher
