import { useI18n } from '../../hooks/useI18n'

function VerifiedPhoneBadge() {
  const { t } = useI18n()

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100">
      <span aria-hidden="true">✓</span>
      {t('common.verifiedPhone')}
    </span>
  )
}

export default VerifiedPhoneBadge
