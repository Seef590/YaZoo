import PropTypes from 'prop-types'

function Toast({ toast, onClose }) {
  const toneStyles = {
    info: {
      container:
        'border-violet-200/90 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(245,237,255,0.94),_rgba(237,233,254,0.88))] text-stone-800',
      badge: 'bg-violet-100 text-violet-800',
    },
    success: {
      container:
        'border-emerald-200/90 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(236,253,245,0.94),_rgba(209,250,229,0.88))] text-stone-800',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    error: {
      container:
        'border-rose-200/90 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(255,241,242,0.95),_rgba(254,226,226,0.9))] text-stone-800',
      badge: 'bg-rose-100 text-rose-800',
    },
  }

  const styles = toneStyles[toast.tone] ?? toneStyles.info

  return (
    <article
      className={`pointer-events-auto w-full max-w-sm rounded-[28px] border p-4 shadow-[0_22px_48px_rgba(124,58,237,0.14)] backdrop-blur ${styles.container}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
          {toast.title}
        </div>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/80 text-stone-500 transition hover:text-stone-900"
          aria-label="Fermer la notification"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="m6.75 6.75 10.5 10.5m0-10.5-10.5 10.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{toast.description}</p>
    </article>
  )
}

Toast.propTypes = {
  toast: PropTypes.object,
  onClose: PropTypes.func,
}

export default Toast
