import { useI18n } from '../../hooks/useI18n'

function AnimalSafetyNotice() {
  const { t } = useI18n()

  return (
    <aside className="rounded-[26px] border border-amber-200/80 bg-[linear-gradient(135deg,_rgba(255,251,235,0.96),_rgba(245,243,255,0.9))] px-4 py-4 text-sm leading-7 text-amber-950 shadow-[0_16px_34px_rgba(245,158,11,0.08)] dark:border-amber-300/18 dark:bg-[linear-gradient(135deg,_rgba(245,158,11,0.12),_rgba(124,58,237,0.12))] dark:text-amber-100 sm:px-5">
      <strong className="mb-1 block text-violet-900 dark:text-violet-100">
        {t('animals.safetyNoticeTitle')}
      </strong>
      {t('animals.safetyNoticeText')}
    </aside>
  )
}

export default AnimalSafetyNotice
