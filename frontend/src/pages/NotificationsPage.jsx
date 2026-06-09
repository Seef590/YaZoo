import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '../api/notifications'
import Button from '../components/ui/Button'
import { useNotifications } from '../hooks/useNotifications'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

function NotificationsPage() {
  const navigate = useNavigate()
  const { refreshUnreadCount, latestNotification } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState([])
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const readCount = notifications.length - unreadCount

  const fetchNotifications = async () => {
    try {
      const response = await getNotificationsRequest()

      setNotifications(response.data.data)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de charger les notifications.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!latestNotification) {
      return
    }

    setNotifications((currentNotifications) =>
      upsertNotification(currentNotifications, latestNotification),
    )
  }, [latestNotification])

  const handleMarkRead = async (notificationId, { silent = false } = {}) => {
    setProcessingIds((current) => [...current, notificationId])

    if (!silent) {
      setErrorMessage('')
      setSuccessMessage('')
    }

    try {
      const response = await markNotificationReadRequest(notificationId)
      const updatedNotification = response.data.data

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification,
        ),
      )

      if (!silent) {
        setSuccessMessage(response.data.message)
      }

      await refreshUnreadCount()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de marquer la notification comme lue.'),
      )
    } finally {
      setProcessingIds((current) => current.filter((id) => id !== notificationId))
    }
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await markAllNotificationsReadRequest()

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      )
      setSuccessMessage(response.data.message)
      await refreshUnreadCount()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de marquer toutes les notifications.'),
      )
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id, { silent: true })
    }

    navigate(notification.actionUrl ?? '/feed')
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.5),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              Notifications
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              Vos alertes importantes ressortent mieux dans un espace plus calme et plus net.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Messages, likes, commandes et rappels arrivent dans une presentation
              plus lisible, plus respiree et plus agreable a traiter au quotidien.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Total" value={notifications.length} />
            <HeroStatCard label="Non lues" value={unreadCount} />
            <HeroStatCard label="Traitees" value={readCount} />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col gap-4 border-b border-violet-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Centre d alertes
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
              {unreadCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              {readCount} deja traitee{readCount > 1 ? 's' : ''}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="w-full sm:w-auto"
            >
              {isMarkingAll ? 'Mise a jour...' : 'Tout marquer comme lu'}
            </Button>
          </div>
        </div>

        {isLoading ? <StateBox>Chargement des notifications...</StateBox> : null}

        {!isLoading && notifications.length === 0 ? (
          <StateBox>Aucune notification pour le moment.</StateBox>
        ) : null}

        {!isLoading && notifications.length > 0 ? (
          <div className="mt-5 space-y-4">
            {notifications.map((notification) => {
              const isProcessing = processingIds.includes(notification.id)
              const isUnread = !notification.isRead

              return (
                <article
                  key={notification.id}
                  className={`rounded-[28px] border p-5 shadow-[0_18px_36px_rgba(124,58,237,0.08)] transition duration-200 ${
                    isUnread
                      ? 'border-violet-200 bg-[linear-gradient(135deg,_rgba(244,237,255,0.96),_rgba(255,255,255,0.96),_rgba(237,233,254,0.78))]'
                      : 'border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.72))]'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-3 py-1 text-xs font-medium text-white shadow-[0_10px_20px_rgba(124,58,237,0.16)]">
                          {formatNotificationType(notification.type)}
                        </span>
                        {isUnread ? (
                          <span className="rounded-full bg-white/88 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                            Nouveau
                          </span>
                        ) : (
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                            Lu
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-stone-950">
                        {notification.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {notification.body}
                      </p>
                      <p className="mt-3 text-xs text-stone-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:flex sm:flex-wrap">
                      <Button
                        type="button"
                        onClick={() => handleOpenNotification(notification)}
                        className="w-full sm:w-auto"
                      >
                        Ouvrir
                      </Button>

                      {!notification.isRead ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto"
                        >
                          {isProcessing ? 'Mise a jour...' : 'Marquer comme lu'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function HeroStatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-white/88 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function StateBox({ children }) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-4 py-16 text-center text-sm text-stone-500">
      {children}
    </div>
  )
}

function formatNotificationType(type) {
  const labels = {
    new_message: 'Message',
    post_comment: 'Commentaire',
    post_like: 'Like',
    community_request_approved: 'Communaute',
    community_request_rejected: 'Communaute',
    reservation_requested: 'Reservation',
    reservation_approved: 'Reservation',
    reservation_rejected: 'Reservation',
    reservation_delivery_updated: 'Livraison',
    reservation_completed: 'Reservation',
    reservation_cancelled: 'Reservation',
  }

  return labels[type] ?? 'Notification'
}

function upsertNotification(currentNotifications, nextNotification) {
  const remainingNotifications = currentNotifications.filter(
    (notification) => notification.id !== nextNotification.id,
  )

  return [nextNotification, ...remainingNotifications].sort(
    (firstNotification, secondNotification) =>
      new Date(secondNotification.createdAt ?? 0).getTime() -
      new Date(firstNotification.createdAt ?? 0).getTime(),
  )
}

export default NotificationsPage
