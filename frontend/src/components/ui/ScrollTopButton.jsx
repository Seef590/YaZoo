import { useEffect, useRef, useState } from 'react'

import { useI18n } from '../../hooks/useI18n'

function ScrollTopButton() {
  const { t } = useI18n()
  const previousScrollY = useRef(0)
  const driftResetTimeout = useRef(null)
  const [scrollState, setScrollState] = useState({
    direction: 'up',
    progress: 0,
    visible: false,
    drift: 0,
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = globalThis.scrollY
      const direction =
        currentScrollY > previousScrollY.current ? 'down' : 'up'
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - globalThis.innerHeight,
        1,
      )
      const progress = Math.min(currentScrollY / maxScroll, 1)

      previousScrollY.current = currentScrollY

      setScrollState((current) => ({
        ...current,
        direction,
        progress,
        visible: currentScrollY > 180,
      }))
    }

    const handleWheel = (event) => {
      const drift = Math.max(-18, Math.min(18, event.deltaY * 0.08))

      setScrollState((current) => ({
        ...current,
        drift,
      }))

      if (driftResetTimeout.current) {
        globalThis.clearTimeout(driftResetTimeout.current)
      }

      driftResetTimeout.current = globalThis.setTimeout(() => {
        setScrollState((current) => ({
          ...current,
          drift: 0,
        }))
      }, 150)
    }

    handleScroll()
    globalThis.addEventListener('scroll', handleScroll, { passive: true })
    globalThis.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      globalThis.removeEventListener('scroll', handleScroll)
      globalThis.removeEventListener('wheel', handleWheel)

      if (driftResetTimeout.current) {
        globalThis.clearTimeout(driftResetTimeout.current)
      }
    }
  }, [])

  const shouldShow =
    scrollState.visible &&
    (
      scrollState.direction === 'up' ||
      scrollState.progress < 0.48 ||
      scrollState.drift < -4
    )
  const offsetY = shouldShow
    ? Math.round((1 - scrollState.progress) * 14 + scrollState.drift)
    : 28

  return (
    <button
      type="button"
      onClick={() => globalThis.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        transform: `translateY(${offsetY}px) scale(${
          scrollState.progress > 0.72 ? 0.97 : 1
        })`,
      }}
      className={`fixed bottom-28 right-3 z-20 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(237,233,254,0.96),rgba(221,214,254,0.98))] px-3.5 text-violet-950 shadow-[0_22px_42px_rgba(124,58,237,0.18)] transition-all duration-300 hover:shadow-[0_28px_48px_rgba(124,58,237,0.22)] ${
        shouldShow
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      } lg:bottom-8 lg:right-8 lg:h-12 lg:px-4`}
      aria-label={t('common.scrollTop')}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M12 18V6m0 0-5.25 5.25M12 6l5.25 5.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="h-2 w-2 rounded-full bg-violet-500/70" />
      <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-violet-900 sm:inline">
        {t('common.top')}
      </span>
    </button>
  )
}

export default ScrollTopButton
