import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import Toast from '../components/ui/Toast'
import { emitErrorToast, emitInfoToast, emitSuccessToast, subscribeToastBus } from '../lib/toastBus'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    )
  }, [])

  const showToast = useCallback((toast) => {
    const normalizedToast = {
      id:
        toast.id ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tone: toast.tone ?? 'info',
      title: toast.title ?? 'Information',
      description: toast.description ?? '',
      duration: toast.duration ?? 4200,
    }

    setToasts((currentToasts) => [...currentToasts, normalizedToast])
  }, [])

  useEffect(() => {
    return subscribeToastBus((toast) => {
      showToast(toast)
    })
  }, [showToast])

  useEffect(() => {
    const timeoutIds = toasts.map((toast) =>
      globalThis.setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration),
    )

    return () => {
      timeoutIds.forEach((timeoutId) => globalThis.clearTimeout(timeoutId))
    }
  }, [removeToast, toasts])

  const value = useMemo(
    () => ({
      showToast,
      showSuccessToast: emitSuccessToast,
      showErrorToast: emitErrorToast,
      showInfoToast: emitInfoToast,
      removeToast,
    }),
    [removeToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(100%-2rem,24rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = {
  children: PropTypes.node,
}
