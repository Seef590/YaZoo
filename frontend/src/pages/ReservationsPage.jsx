import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  approveReservationRequest,
  cancelReservationRequest,
  completeReservationRequest,
  getReservationsRequest,
  rejectReservationRequest,
  updateReservationDeliveryStatusRequest,
} from '../api/reservations'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

function ReservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [buyerReservations, setBuyerReservations] = useState([])
  const [sellerReservations, setSellerReservations] = useState([])
  const [activeTab, setActiveTab] = useState('buyer')
  const [search, setSearch] = useState(queryFromUrl)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')

  const loadReservations = async () => {
    try {
      const response = await getReservationsRequest()

      setBuyerReservations(response.data.buyerReservations ?? [])
      setSellerReservations(response.data.sellerReservations ?? [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de charger vos reservations.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    setSearch(queryFromUrl)
  }, [queryFromUrl])

  const reservations =
    activeTab === 'buyer' ? buyerReservations : sellerReservations
  const visibleReservations = filterReservations(reservations, queryFromUrl)

  const handleSearch = (event) => {
    event.preventDefault()

    if (search.trim()) {
      setSearchParams({ q: search.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleResetSearch = () => {
    setSearch('')
    setSearchParams({})
  }

  const handleAction = async (action, reservation, payload = null) => {
    const confirmed = globalThis.confirm(buildConfirmMessage(action, reservation))

    if (!confirmed) {
      return
    }

    setProcessingId(`${action}-${reservation.id}`)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (action === 'approve') {
        await approveReservationRequest(reservation.id)
      }

      if (action === 'reject') {
        await rejectReservationRequest(reservation.id)
      }

      if (action === 'cancel') {
        await cancelReservationRequest(reservation.id)
      }

      if (action === 'complete') {
        await completeReservationRequest(reservation.id)
      }

      if (action === 'delivery') {
        await updateReservationDeliveryStatusRequest(reservation.id, payload)
      }

      setSuccessMessage(buildSuccessMessage(action, payload))
      await loadReservations()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible d'effectuer cette action."),
      )
    } finally {
      setProcessingId('')
    }
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.48),_transparent_26%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              Commandes
            </p>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              Gardez chaque reservation sous controle avec une experience plus sereine.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Suivez vos achats, vos ventes, la logistique et la facture finale
              dans un espace plus clair, plus rassurant et plus confortable a relire.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Mes achats" value={buyerReservations.length} />
            <HeroStatCard label="Mes ventes" value={sellerReservations.length} />
            <HeroStatCard label="Section active" value={activeTab === 'buyer' ? 'Achats' : 'Ventes'} />
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

      <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Commandes
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Centre de commandes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Pilotez chaque etape, du premier accord jusqu a la livraison et la facture.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap">
            <LinkButton to="/orders/history" variant="ghost" className="w-full sm:w-auto">
              Historique
            </LinkButton>

            <button
              type="button"
              onClick={() => setActiveTab('buyer')}
              className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                activeTab === 'buyer'
                  ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                  : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
              }`}
            >
              Mes achats ({buyerReservations.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seller')}
              className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                activeTab === 'seller'
                  ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                  : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
              }`}
            >
              Mes ventes ({sellerReservations.length})
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une reservation, un contact, une ville..."
            className="flex-1 rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(248,245,255,0.98),_rgba(255,255,255,0.94))] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white"
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Button type="submit" className="w-full sm:w-auto">
              Rechercher
            </Button>
            {queryFromUrl ? (
              <Button type="button" variant="ghost" onClick={handleResetSearch} className="w-full sm:w-auto">
                Reinitialiser
              </Button>
            ) : null}
          </div>
        </form>

        {isLoading ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
            Chargement des reservations...
          </div>
        ) : null}

        {!isLoading && reservations.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
            Aucune reservation dans cette section pour le moment.
          </div>
        ) : null}

        {!isLoading && reservations.length > 0 && visibleReservations.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
            Aucune reservation ne correspond a votre recherche.
          </div>
        ) : null}

        {!isLoading && visibleReservations.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                processingId={processingId}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : null}
      </section>
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

function ReservationCard({ reservation, processingId, onAction }) {
  const counterpart = reservation.isBuyer ? reservation.seller : reservation.buyer
  const imageUrl = reservation.listing?.imageUrl
  const message = reservation.isBuyer
    ? `Bonjour, je fais suite a ma commande pour "${reservation.listing.title}".`
    : `Bonjour, je vous contacte au sujet de votre commande pour "${reservation.listing.title}".`
  const contactPath = counterpart?.email
    ? `/messages?email=${encodeURIComponent(counterpart.email)}&message=${encodeURIComponent(message)}`
    : null

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      {imageUrl ? (
        <div className="h-48 bg-stone-200 sm:h-60 md:h-72 lg:h-80">
          <img
            src={imageUrl}
            alt={reservation.listing.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusChip>{formatReservationStatus(reservation.reservationStatus)}</StatusChip>
              <StatusChip tone="light">
                {formatDeliveryStatus(reservation.deliveryStatus)}
              </StatusChip>
              <StatusChip tone="light">{formatReservationKind(reservation.kind)}</StatusChip>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-stone-950">
              {reservation.listing.title}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {formatDate(reservation.createdAt)}
            </p>
          </div>

        <div className="w-full rounded-[22px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.1),_rgba(216,180,254,0.22),_rgba(255,255,255,0.94))] px-4 py-3 text-left sm:w-auto sm:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Total TTC</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {formatPrice(reservation.grandTotal)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 shadow-sm">
          <Avatar name={counterpart?.name ?? 'Contact'} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">
              {counterpart?.name ?? 'Contact indisponible'}
            </p>
            <p className="truncate text-xs text-stone-500">
              {counterpart?.email ?? 'Email indisponible'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Paiement" value={formatPaymentMethod(reservation.paymentMethod)} />
          <Info label="Statut paiement" value={formatPaymentStatus(reservation.paymentStatus)} />
          <Info label="Livraison" value={formatDeliveryMethod(reservation.deliveryMethod)} />
          <Info label="Quantite" value={reservation.quantity} />
          <Info label="Sous-total" value={formatPrice(reservation.totalPrice)} />
          <Info label="Frais livraison" value={formatPrice(reservation.deliveryFee)} />
        </div>

        <div className="rounded-[22px] bg-white/90 px-4 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
            Adresse / retrait
          </p>
          <p className="mt-2 text-sm font-medium text-stone-900">
            {reservation.deliveryMethod === 'delivery'
              ? [reservation.delivery.contactName, reservation.delivery.phone, reservation.delivery.city]
                  .filter(Boolean)
                  .join(' - ')
              : 'Retrait sur place'}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {reservation.delivery.address || reservation.listing.location || 'Aucune adresse fournie'}
          </p>
          {reservation.delivery.notes ? (
            <p className="mt-2 text-sm text-stone-500">{reservation.delivery.notes}</p>
          ) : null}
        </div>

        {reservation.note ? (
          <p className="text-sm leading-6 text-stone-600">{reservation.note}</p>
        ) : null}

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {reservation.listing.routePath ? (
            <LinkButton to={reservation.listing.routePath} variant="secondary" className="w-full sm:w-auto">
              Voir l'annonce
            </LinkButton>
          ) : null}

          {contactPath ? (
            <LinkButton to={contactPath} variant="ghost" className="w-full sm:w-auto">
              Contacter
            </LinkButton>
          ) : null}

          {reservation.canViewInvoice ? (
            <LinkButton to={`/reservations/${reservation.id}/invoice`} variant="ghost" className="w-full sm:w-auto">
              Facture
            </LinkButton>
          ) : null}

          {reservation.canApprove ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`approve-${reservation.id}`}
              onClick={() => onAction('approve', reservation)}
              className="w-full sm:w-auto"
            >
              Approuver
            </ActionButton>
          ) : null}

          {reservation.canReject ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`reject-${reservation.id}`}
              onClick={() => onAction('reject', reservation)}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              Refuser
            </ActionButton>
          ) : null}

          {reservation.canCancel ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`cancel-${reservation.id}`}
              onClick={() => onAction('cancel', reservation)}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              Annuler
            </ActionButton>
          ) : null}

          {reservation.canMarkShipped ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`delivery-${reservation.id}`}
              onClick={() =>
                onAction('delivery', reservation, { delivery_status: 'shipped' })
              }
              className="w-full sm:w-auto"
            >
              Marquer expediee
            </ActionButton>
          ) : null}

          {reservation.canMarkDelivered ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`delivery-${reservation.id}`}
              onClick={() =>
                onAction('delivery', reservation, { delivery_status: 'delivered' })
              }
              className="w-full sm:w-auto"
            >
              Marquer livree
            </ActionButton>
          ) : null}

          {reservation.canMarkPickedUp ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`delivery-${reservation.id}`}
              onClick={() =>
                onAction('delivery', reservation, { delivery_status: 'picked_up' })
              }
              className="w-full sm:w-auto"
            >
              Marquer recuperee
            </ActionButton>
          ) : null}

          {reservation.canComplete ? (
            <ActionButton
              processingId={processingId}
              buttonKey={`complete-${reservation.id}`}
              onClick={() => onAction('complete', reservation)}
              className="w-full sm:w-auto"
            >
              Finaliser + facturer
            </ActionButton>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ActionButton({
  children,
  processingId,
  buttonKey,
  onClick,
  variant = 'primary',
  className = '',
}) {
  return (
    <Button
      type="button"
      variant={variant}
      disabled={processingId === buttonKey}
      onClick={onClick}
      className={className}
    >
      {processingId === buttonKey ? 'Action...' : children}
    </Button>
  )
}

function LinkButton({ children, to, variant = 'primary', className = '' }) {
  const variants = {
    primary:
      'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white hover:brightness-105 focus-visible:outline-violet-500',
    secondary:
      'bg-white text-violet-900 ring-1 ring-inset ring-violet-200 hover:bg-violet-50 focus-visible:outline-violet-300',
    ghost:
      'bg-violet-50 text-violet-800 hover:bg-violet-100 focus-visible:outline-violet-200',
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

function StatusChip({ children, tone = 'dark' }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        tone === 'dark'
          ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7)] text-white'
          : 'bg-violet-50 text-violet-800'
      }`}
    >
      {children}
    </span>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

function buildConfirmMessage(action, reservation) {
  const title = reservation.listing.title

  if (action === 'approve') {
    return `Approuver la reservation pour "${title}" ?`
  }

  if (action === 'reject') {
    return `Refuser la reservation pour "${title}" ?`
  }

  if (action === 'cancel') {
    return `Annuler la reservation pour "${title}" ?`
  }

  if (action === 'delivery') {
    return `Mettre a jour le statut de livraison pour "${title}" ?`
  }

  return `Finaliser la commande pour "${title}" et generer la facture ?`
}

function buildSuccessMessage(action, payload) {
  const deliveryStatus = payload?.delivery_status

  if (action === 'delivery') {
    const labels = {
      shipped: 'Commande marquee comme expediee.',
      delivered: 'Commande marquee comme livree.',
      picked_up: 'Commande marquee comme recuperee.',
    }

    return labels[deliveryStatus] ?? 'Livraison mise a jour avec succes.'
  }

  const messages = {
    approve: 'Reservation approuvee avec succes.',
    reject: 'Reservation refusee avec succes.',
    cancel: 'Reservation annulee avec succes.',
    complete: 'Commande finalisee et facture generee.',
  }

  return messages[action] ?? 'Action effectuee.'
}

function formatReservationKind(kind) {
  return kind === 'animal' ? 'Animal' : 'Produit'
}

function formatReservationStatus(status) {
  const labels = {
    pending: 'En attente',
    approved: 'Approuvee',
    rejected: 'Refusee',
    cancelled: 'Annulee',
    completed: 'Finalisee',
  }

  return labels[status] ?? 'En attente'
}

function formatPaymentStatus(status) {
  const labels = {
    pending: 'Paiement en attente',
    paid: 'Paiement paye',
    cancelled: 'Paiement annule',
  }

  return labels[status] ?? 'Paiement en attente'
}

function formatPaymentMethod(method) {
  const labels = {
    cash_on_pickup: 'Paiement a la remise',
    bank_transfer: 'Virement bancaire',
  }

  return labels[method] ?? 'Paiement a la remise'
}

function formatDeliveryMethod(method) {
  return method === 'delivery' ? 'Livraison' : 'Retrait'
}

function formatDeliveryStatus(status) {
  const labels = {
    pending: 'En attente',
    preparing: 'En preparation',
    ready_for_pickup: 'Pret au retrait',
    shipped: 'Expediee',
    delivered: 'Livree',
    picked_up: 'Recuperee',
  }

  return labels[status] ?? 'En attente'
}

function formatPrice(value) {
  if (!value) {
    return '0 MAD'
  }

  return `${value} MAD`
}

function filterReservations(reservations, searchTerm) {
  if (!searchTerm) {
    return reservations
  }

  const normalizedSearch = normalizeSearchText(searchTerm)

  return reservations.filter((reservation) => {
    const counterpart = reservation.isBuyer ? reservation.seller : reservation.buyer

    return [
      reservation.listing?.title,
      reservation.listing?.location,
      reservation.delivery?.city,
      reservation.delivery?.address,
      counterpart?.name,
      counterpart?.email,
      reservation.reservationStatus,
      reservation.deliveryStatus,
      reservation.kind,
      reservation.note,
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch))
  })
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default ReservationsPage
