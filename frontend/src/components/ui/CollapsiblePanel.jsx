import { useId } from 'react'

function CollapsiblePanel({
  kicker,
  title,
  description,
  summary,
  isOpen,
  onToggle,
  actions = null,
  children,
}) {
  const contentId = useId()

  return (
    <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          {kicker ? (
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              {kicker}
            </p>
          ) : null}
          <h2 className="mt-2 text-xl font-semibold text-stone-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-stone-500">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {summary ? (
            <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              {summary}
            </span>
          ) : null}

          {actions}

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-violet-200 hover:bg-violet-50"
            aria-expanded={isOpen}
            aria-controls={contentId}
          >
            <span>{isOpen ? 'Masquer' : 'Afficher'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path
                d="m6.75 9.75 5.25 5.25 5.25-5.25"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div id={contentId} className={isOpen ? 'mt-5' : 'hidden'}>
        {children}
      </div>
    </section>
  )
}

export default CollapsiblePanel
