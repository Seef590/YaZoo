import { useState } from 'react'

import { exportPrivacyData } from '../../api/privacy'
import { useI18n } from '../../hooks/useI18n'
import { getErrorMessage } from '../../utils/getErrorMessage'
import Button from '../ui/Button'

function ExportDataButton() {
  const { t } = useI18n()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await exportPrivacyData()
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'yazoo-data-export.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setMessage(t('privacy.settings.exportSuccess'))
    } catch (error) {
      setMessage(getErrorMessage(error, t('privacy.settings.exportError')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button type="button" onClick={handleExport} disabled={isLoading}>
        {isLoading ? t('common.loading') : t('privacy.settings.exportButton')}
      </Button>
      {message ? (
        <p className="mt-3 text-sm text-stone-600 dark:text-violet-100/78">
          {message}
        </p>
      ) : null}
    </div>
  )
}

export default ExportDataButton
