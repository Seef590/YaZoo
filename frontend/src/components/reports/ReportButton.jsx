import { useState } from 'react'
import PropTypes from 'prop-types'

import { useI18n } from '../../hooks/useI18n'
import ReportModal from './ReportModal'

function ReportButton({ reportableType, reportableId, hidden = false, isOwner = false }) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  if (hidden || isOwner || !reportableType || !reportableId) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100"
      >
        {t('reports.report')}
      </button>
      <ReportModal
        isOpen={isOpen}
        reportableType={reportableType}
        reportableId={reportableId}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

ReportButton.propTypes = {
  reportableType: PropTypes.string.isRequired,
  reportableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  hidden: PropTypes.bool,
  isOwner: PropTypes.bool,
}

export default ReportButton
