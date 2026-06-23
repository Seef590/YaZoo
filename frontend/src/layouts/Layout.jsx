import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Footer from '../components/ui/Footer'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { useNotifications } from '../hooks/useNotifications'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isBootstrapping, logout, user } = useAuth()
  const { isRtl, t } = useI18n()
  const { unreadCount } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const mobileMenuTriggerRef = useRef(null)
  const mobileMenuCloseRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    const focusTimerId = globalThis.setTimeout(() => {
      mobileMenuCloseRef.current?.focus()
    }, 30)

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown)
      globalThis.clearTimeout(focusTimerId)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      mobileMenuTriggerRef.current?.focus()
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') ?? ''
    const timeoutId = globalThis.setTimeout(() => {
      setGlobalSearch(query)
    }, 0)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [location.search])

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-violet-100" />
          <div className="mx-auto mt-4 h-4 w-40 animate-pulse rounded-full bg-violet-100" />
          <div className="mx-auto mt-3 h-3 w-56 animate-pulse rounded-full bg-violet-50" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleCreateStory = () => {
    navigate('/feed', {
      state: {
        openStoryComposer: true,
      },
    })
  }

  const handleGlobalSearch = (event) => {
    event.preventDefault()

    const query = globalSearch.trim()
    const targetPath = getSearchTargetPath(location.pathname)

    if (!query) {
      navigate(targetPath)
      return
    }

    navigate(`${targetPath}?q=${encodeURIComponent(query)}`)
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { to: '/feed', label: t('common.feed') },
    { to: '/profile', label: t('common.profile') },
    { to: '/marketplace', label: t('common.marketplace') },
    { to: '/communities', label: t('common.communities') },
    { to: '/messages', label: t('common.messages') },
    { to: '/reservations', label: t('common.reservations') },
    { to: '/orders/history', label: t('common.history') },
    { to: '/settings', label: t('common.settings') },
    {
      to: '/notifications',
      label: unreadCount > 0
        ? `${t('common.notifications')} (${unreadCount})`
        : t('common.notifications'),
    },
  ]

  if (user?.isAdmin) {
    navigationItems.push(
      { to: '/admin/moderation', label: t('common.adminContent') },
      { to: '/admin/orders', label: t('common.adminOrders') },
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,208,255,0.24),_transparent_20%),linear-gradient(180deg,_#fffaff_0%,_#f7f1ff_100%)] transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.26),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(76,29,149,0.28),_transparent_24%),linear-gradient(180deg,_#08050d_0%,_#12091f_54%,_#1b1030_100%)]">
      <div className="w-full overflow-x-clip px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4 lg:px-6 lg:pb-8">
        <header className="sticky top-3 z-30 rounded-[26px] border border-white/55 bg-[linear-gradient(135deg,_rgba(255,255,255,0.52),_rgba(248,240,255,0.36),_rgba(255,255,255,0.24))] p-3 shadow-[0_20px_48px_rgba(124,58,237,0.1)] backdrop-blur-2xl transition-colors dark:border-violet-300/15 dark:bg-[linear-gradient(135deg,_rgba(24,16,38,0.82),_rgba(49,24,83,0.54),_rgba(12,8,20,0.72))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:p-4">
          <div className="flex items-center gap-3">
            <NavLink to="/feed" className="flex min-w-0 items-center gap-3">
              <img src="/yazoo-logo.svg" alt={t('layout.logoLabel')} className="h-12 w-12 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="yz-wordmark truncate text-base">YaZoo</p>
                <p className="truncate text-xs text-stone-700 dark:text-violet-100/78">{t('common.tagline')}</p>
              </div>
            </NavLink>

            <form onSubmit={handleGlobalSearch} className="hidden min-w-[220px] flex-1 md:block">
              <SearchInput value={globalSearch} onChange={setGlobalSearch} />
            </form>

            <div className="ms-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                ref={mobileMenuTriggerRef}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/55 bg-white/35 text-stone-700 transition hover:border-violet-200 hover:bg-white/55 hover:text-violet-900 lg:hidden"
                aria-label={t('layout.menuOpen')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="yazoo-mobile-navigation"
              >
                <AppIcon name="menu" className="h-5 w-5" />
              </button>

              <DesktopActionLink to="/feed" icon="home" label={t('common.feed')} className="hidden lg:inline-flex" />
              <DesktopActionLink to="/messages" icon="chat" label={t('common.messages')} className="hidden lg:inline-flex" />
              <DesktopActionLink to="/notifications" icon="bell" label={t('common.notifications')} className="hidden lg:inline-flex" />

              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full border border-white/50 bg-white/35 px-3 py-1.5 transition hover:bg-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 dark:border-violet-300/15 dark:bg-white/8 dark:hover:bg-white/14 lg:flex"
                aria-label={t('profile.viewProfile')}
              >
                <Avatar
                  name={user?.name ?? t('common.user')}
                  src={user?.avatar || ''}
                  className="h-7 w-7 border border-white/80 text-[10px]"
                />
                <span className="max-w-[120px] truncate text-xs font-medium text-stone-700 dark:text-violet-50">
                  {user?.name ?? t('common.user')}
                </span>
              </Link>

              <Button type="button" variant="secondary" onClick={logout} className="hidden lg:inline-flex">
                {t('common.logout')}
              </Button>
            </div>
          </div>

          <form onSubmit={handleGlobalSearch} className="mt-3 md:hidden">
            <SearchInput value={globalSearch} onChange={setGlobalSearch} />
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
            <InlinePill>
              {t('layout.unread', { count: unreadCount, suffix: unreadCount > 1 ? 's' : '' })}
            </InlinePill>
            {user?.isAdmin ? <InlinePill tone="violet">{t('common.adminContent')}</InlinePill> : null}
          </div>
        </header>

        <DesktopNav items={navigationItems} />

        <main className="mt-4 min-w-0 rounded-[30px] border border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.6),_rgba(248,241,255,0.42),_rgba(255,255,255,0.28))] p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] shadow-[0_24px_70px_rgba(124,58,237,0.1)] backdrop-blur-2xl transition-colors dark:border-violet-300/14 dark:bg-[linear-gradient(180deg,_rgba(5,3,10,0.9),_rgba(24,11,43,0.82),_rgba(8,5,13,0.88))] dark:shadow-[0_30px_80px_rgba(0,0,0,0.44)] sm:rounded-[34px] sm:p-5 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-5">
          <Outlet />
          <Footer mode="app" className="mt-8" />
        </main>
      </div>

      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        items={navigationItems}
        user={user}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={logout}
        onCreateStory={handleCreateStory}
        closeButtonRef={mobileMenuCloseRef}
        isRtl={isRtl}
        t={t}
      />

      <MobileBottomDock user={user} onCreateStory={handleCreateStory} t={t} />
    </div>
  )
}

function DesktopNav({ items }) {
  return (
    <nav className="mt-3 hidden overflow-x-auto rounded-[24px] border border-white/55 bg-[linear-gradient(135deg,_rgba(255,255,255,0.44),_rgba(248,240,255,0.32),_rgba(255,255,255,0.2))] p-2 shadow-[0_16px_36px_rgba(124,58,237,0.08)] backdrop-blur-2xl transition-colors dark:border-violet-300/12 dark:bg-[linear-gradient(135deg,_rgba(24,16,38,0.64),_rgba(49,24,83,0.34),_rgba(12,8,20,0.56))] lg:block">
      <div className="mx-auto flex min-w-max items-center justify-center gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                  : 'text-stone-600 hover:bg-white/55 hover:text-violet-900 dark:text-violet-100/78 dark:hover:bg-white/10 dark:hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function SearchInput({ value, onChange }) {
  const { t } = useI18n()

  return (
    <label className="block">
      <span className="sr-only">{t('common.search')}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('common.searchPlaceholder')}
        className="w-full rounded-full border border-white/55 bg-white/70 px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white dark:border-violet-300/14 dark:bg-white/10 dark:text-violet-50 dark:placeholder:text-violet-100/45 dark:focus:bg-white/14"
      />
    </label>
  )
}

function getSearchTargetPath(pathname) {
  if (pathname.startsWith('/marketplace/products')) {
    return '/marketplace/products'
  }

  if (pathname.startsWith('/marketplace')) {
    return '/marketplace'
  }

  const searchablePaths = [
    '/feed',
    '/profile',
    '/communities',
    '/messages',
    '/reservations',
    '/notifications',
    '/orders/history',
  ]

  return searchablePaths.includes(pathname) ? pathname : '/feed'
}

function MobileMenuDrawer({
  isOpen,
  items,
  user,
  onClose,
  onLogout,
  onCreateStory,
  closeButtonRef,
  isRtl,
  t,
}) {
  const closedTransform = isRtl ? '-translate-x-full' : 'translate-x-full'
  const sideClass = isRtl
    ? 'left-0 border-r'
    : 'right-0 border-l'

  return (
    <div className={`fixed inset-0 z-40 lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('layout.menuClose')}
        className={`absolute inset-0 bg-violet-950/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        id="yazoo-mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label={t('layout.mainMenu')}
        className={`absolute top-0 h-full w-[86%] max-w-sm overflow-y-auto border-white/55 bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(246,239,255,0.95))] p-4 shadow-[0_30px_70px_rgba(124,58,237,0.2)] backdrop-blur-2xl transition-transform duration-300 dark:border-violet-300/16 dark:bg-[linear-gradient(180deg,_rgba(12,8,20,0.98),_rgba(32,16,55,0.96))] ${sideClass} ${isOpen ? 'translate-x-0' : closedTransform}`}
          >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              onClick={onClose}
              className="shrink-0 rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
              aria-label={t('profile.viewProfile')}
            >
              <Avatar
                name={user?.name ?? t('common.user')}
                src={user?.avatar || ''}
                className="border border-white/80"
              />
            </Link>
            <div>
              <p className="text-sm font-semibold text-stone-950 dark:text-violet-50">{user?.name ?? t('common.user')}</p>
              <p className="text-xs text-stone-500">
                {t('layout.quickNavigation')} <span className="yz-wordmark text-xs font-semibold">YaZoo</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/55 bg-white/55 text-stone-700 transition hover:border-violet-200 hover:text-violet-900"
            aria-label={t('layout.menuClose')}
          >
            <AppIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-5 space-y-2">
          {items.map((item) => (
            <NavLink
              key={`mobile-menu-${item.to}`}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                    : 'text-stone-700 hover:bg-violet-50 hover:text-violet-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 grid gap-3">
          <Button
            type="button"
            onClick={() => {
              onClose()
              onCreateStory()
            }}
          >
            {t('creation.createStory')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose()
              onLogout()
            }}
          >
            {t('common.logout')}
          </Button>
        </div>
      </aside>
    </div>
  )
}

function DesktopActionLink({ to, icon, label, className = '' }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${className} h-10 w-10 items-center justify-center rounded-2xl border transition ${
          isActive
            ? 'border-violet-300 bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_10px_22px_rgba(124,58,237,0.18)]'
            : 'border-white/55 bg-white/35 text-stone-700 hover:border-violet-200 hover:bg-white/55 hover:text-violet-900'
        }`
      }
      aria-label={label}
      title={label}
    >
      <AppIcon name={icon} className="h-5 w-5" />
    </NavLink>
  )
}

function MobileBottomDock({ user, onCreateStory, t }) {
  return (
    <nav className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-1rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-[24px] border border-white/55 bg-[linear-gradient(135deg,_rgba(255,255,255,0.46),_rgba(248,240,255,0.32),_rgba(255,255,255,0.18))] px-1.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_20px_44px_rgba(124,58,237,0.14)] backdrop-blur-2xl dark:border-violet-300/16 dark:bg-[linear-gradient(135deg,_rgba(24,16,38,0.84),_rgba(49,24,83,0.58),_rgba(12,8,20,0.72))] lg:hidden">
      <MobileDockLink to="/feed" label={t('common.feed')} icon="home" />
      <MobileDockLink to="/marketplace" label={t('common.marketplaceShort')} icon="search" />
      <MobileDockStoryButton onClick={onCreateStory} label={t('common.story')} />
      <MobileDockLink to="/messages" label={t('common.messagesShort')} icon="chat" />
      <MobileDockProfileLink user={user} label={t('common.profile')} />
    </nav>
  )
}

function MobileDockLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex min-w-[56px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
          isActive
            ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
            : 'text-stone-500 hover:bg-violet-50'
        }`
      }
    >
      <AppIcon name={icon} className="h-5 w-5" />
      <span className="max-w-[4.25rem] truncate whitespace-nowrap">{label}</span>
    </NavLink>
  )
}

function MobileDockProfileLink({ user, label }) {
  const { t } = useI18n()

  return (
    <NavLink
      to="/profile"
      className={({ isActive }) =>
        `relative flex min-w-[56px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
          isActive
            ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
            : 'text-stone-500 hover:bg-violet-50'
        }`
      }
    >
      <Avatar
        name={user?.name ?? t('common.user')}
        src={user?.avatar || ''}
        className="h-5 w-5 border border-white/80 text-[10px]"
      />
      <span className="max-w-[4.25rem] truncate whitespace-nowrap">{label}</span>
    </NavLink>
  )
}

function MobileDockStoryButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[64px] flex-col items-center gap-1 rounded-[20px] bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105"
      aria-label={label}
    >
      <AppIcon name="story" className="h-5 w-5" />
      <span className="max-w-[4.25rem] truncate whitespace-nowrap">{label}</span>
    </button>
  )
}

function InlinePill({ children, tone = 'stone' }) {
  const tones = {
    stone: 'border border-white/50 bg-white/32 text-stone-700 backdrop-blur-xl',
    violet: 'border border-violet-200/40 bg-violet-500/10 text-violet-950 backdrop-blur-xl',
    emerald: 'border border-emerald-200/45 bg-emerald-500/10 text-emerald-900 backdrop-blur-xl',
    amber: 'border border-amber-200/50 bg-amber-400/12 text-amber-900 backdrop-blur-xl',
  }

  return (
    <div className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium shadow-[0_8px_20px_rgba(124,58,237,0.06)] ${tones[tone]}`}>
      {children}
    </div>
  )
}

function AppIcon({ name, className = 'h-5 w-5' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M3.75 10.5 12 4.5l8.25 6v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-4.5v6h-4.5a1.5 1.5 0 0 1-1.5-1.5V10.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'chat') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M7.5 16.5 4.5 19.5v-12A2.25 2.25 0 0 1 6.75 5.25h10.5A2.25 2.25 0 0 1 19.5 7.5v6A2.25 2.25 0 0 1 17.25 15.75H7.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M14.25 18.75a2.25 2.25 0 1 1-4.5 0m7.5-6v-1.5a5.25 5.25 0 1 0-10.5 0v1.5L5.25 15v1.5h13.5V15l-1.5-2.25Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'story') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M12 20.25a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 8.25v7.5m3.75-3.75h-7.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'search') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="m16.5 16.5 3.75 3.75m-1.5-8.625a7.125 7.125 0 1 1-14.25 0 7.125 7.125 0 0 1 14.25 0Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'menu') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M4.5 7.5h15m-15 4.5h15m-15 4.5h15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'close') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="m6.75 6.75 10.5 10.5m0-10.5-10.5 10.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4.5v15m7.5-7.5h-15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

DesktopNav.propTypes = {
  items: PropTypes.array,
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

MobileMenuDrawer.propTypes = {
  isOpen: PropTypes.bool,
  items: PropTypes.array,
  user: PropTypes.object,
  onClose: PropTypes.func,
  onLogout: PropTypes.func,
  onCreateStory: PropTypes.func,
  closeButtonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  isRtl: PropTypes.bool,
  t: PropTypes.func,
}

DesktopActionLink.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
}

MobileBottomDock.propTypes = {
  user: PropTypes.object,
  onCreateStory: PropTypes.func,
  t: PropTypes.func,
}

MobileDockLink.propTypes = {
  to: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
}

MobileDockProfileLink.propTypes = {
  user: PropTypes.object,
  label: PropTypes.string,
}

MobileDockStoryButton.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
}

InlinePill.propTypes = {
  children: PropTypes.node,
  tone: PropTypes.string,
}

AppIcon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
}

export default Layout
