import PropTypes from 'prop-types'

import { useI18n } from '../../hooks/useI18n'

const BADGE_STYLES = {
  professionalApproved: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-300/18 dark:bg-emerald-400/10 dark:text-emerald-100',
  professionalRejected: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-300/18 dark:bg-rose-400/10 dark:text-rose-100',
  documentsPending: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-300/18 dark:bg-amber-400/10 dark:text-amber-100',
  animalPending: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-300/18 dark:bg-amber-400/10 dark:text-amber-100',
  animalApproved: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-300/18 dark:bg-emerald-400/10 dark:text-emerald-100',
  animalRejected: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-300/18 dark:bg-rose-400/10 dark:text-rose-100',
  animalSuspended: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-300/18 dark:bg-rose-400/10 dark:text-rose-100',
  onssaProvided: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-300/18 dark:bg-sky-400/10 dark:text-sky-100',
}

function ComplianceBadge({ type }) {
  const { t } = useI18n()

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-semibold ${BADGE_STYLES[type] ?? BADGE_STYLES.documentsPending}`}
    >
      {t(`compliance.badges.${type}`)}
    </span>
  )
}

ComplianceBadge.propTypes = {
  type: PropTypes.string.isRequired,
}

export default ComplianceBadge
