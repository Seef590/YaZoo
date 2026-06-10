import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { getOrdersHistoryRequest } from '../api/reservations'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

function OrderHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [buyerHistory, setBuyerHistory] = useState([])
  const [sellerHistory, setSellerHistory] = useState([])
  const [activeTab, setActiveTab] = useState('buyer')
  const [search, setSearch] = useState(queryFromUrl)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      try {
        const response = await getOrdersHistoryRequest()

        if (!cancelled) {
          setBuyerHistory(response.data.buyerHistory ?? [])
          setSellerHistory(response.data.sellerHistory ?? [])
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger l'historique des commandes."),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [])

  const orders = activeTab === 'buyer' ? buyerHistory : sellerHistory
  const visibleOrders = filterOrders(orders, queryFromUrl)

  useEffect(() => {
    setSearch(queryFromUrl)
  }, [queryFromUrl])

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

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.5),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              Historique
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              Retrouvez vos commandes archivees dans une lecture plus elegante et plus rassurante.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Chaque achat et chaque vente garde ses informations essentielles,
              mais dans une presentation plus premium, plus calme et plus facile
              a parcourir sur mobile comme sur desktop.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Achats" value={buyerHistory.length} />
            <HeroStatCard label="Ventes" value={sellerHistory.length} />
            <HeroStatCard label="Section active" value={activeTab === 'buyer' ? 'Achats' : 'Ventes'} />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Archives
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Historique des commandes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Relisez vos anciennes commandes, factures et contacts sans perdre le fil.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('buyer')}
              className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                activeTab === 'buyer'
                  ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                  : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
              }`}
            >
              Mes achats ({buyerHistory.length})
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
              Mes ventes ({sellerHistory.length})
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une commande, une facture, un contact..."
            className="flex-1 rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(248,245,255,0.98),_rgba(255,255,255,0.94))] px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300 focus:bg-white"
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <button
              type="submit"
              className="w-full rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 sm:w-auto"
            >
              Rechercher
            </button>
            {queryFromUrl ? (
              <button
                type="button"
                onClick={handleResetSearch}
                className="w-full rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 sm:w-auto"
              >
                Reinitialiser
              </button>
            ) : null}
          </div>
        </form>

        {isLoading ? (
          <StateBox>Chargement de l'historique...</StateBox>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <StateBox>Aucun historique disponible pour cette section.</StateBox>
        ) : null}

        {!isLoading && orders.length > 0 && visibleOrders.length === 0 ? (
          <StateBox>Aucune commande ne correspond a votre recherche.</StateBox>
        ) : null}

        {!isLoading && visibleOrders.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleOrders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
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

function StateBox({ children }) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
      {children}
    </div>
  )
}

function OrderHistoryCard({ order }) {
  const counterpart = order.isBuyer ? order.seller : order.buyer

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      {order.listing?.imageUrl ? (
        <div className="h-44 bg-stone-200">
          <img
            src={order.listing.imageUrl}
            alt={order.listing.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-1 text-xs font-medium text-white">
                {formatOrderStatus(order.reservationStatus)}
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
                {formatDeliveryStatus(order.deliveryStatus)}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-stone-950">
              {order.listing.title}
            </h3>
            <p className="mt-1 text-sm text-stone-500">{formatDate(order.createdAt)}</p>
          </div>

          <div className="w-full rounded-[22px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.1),_rgba(216,180,254,0.22),_rgba(255,255,255,0.94))] px-4 py-3 text-left sm:w-auto sm:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {formatPrice(order.grandTotal ?? order.totalPrice)}
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
          <Info label="Paiement" value={formatPaymentStatus(order.paymentStatus)} />
          <Info label="Livraison" value={formatDeliveryMethod(order.deliveryMethod)} />
          <Info label="Quantite" value={order.quantity} />
          <Info label="Facture" value={order.invoiceNumber || 'Non disponible'} />
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {order.listing?.routePath ? (
            <LinkButton to={order.listing.routePath} variant="secondary" className="w-full sm:w-auto">
              Voir l'annonce
            </LinkButton>
          ) : null}

          {order.invoiceNumber ? (
            <LinkButton to={`/reservations/${order.id}/invoice`} variant="primary" className="w-full sm:w-auto">
              Voir la facture
            </LinkButton>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function LinkButton({ children, to, variant = 'primary', className = '' }) {
  const variants = {
    primary:
      'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)] hover:brightness-105 focus-visible:outline-violet-500',
    secondary:
      'bg-violet-50 text-violet-800 hover:bg-violet-100 focus-visible:outline-violet-300',
    ghost:
      'bg-white text-stone-700 ring-1 ring-inset ring-violet-100 hover:bg-violet-50 focus-visible:outline-violet-200',
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

function Info({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

function formatOrderStatus(status) {
  const labels = {
    completed: 'Finalisee',
    cancelled: 'Annulee',
    rejected: 'Refusee',
  }

  return labels[status] ?? 'Archivee'
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

function formatDeliveryMethod(method) {
  return method === 'delivery' ? 'Livraison' : 'Retrait'
}

function formatPaymentStatus(status) {
  const labels = {
    paid: 'Paye',
    cancelled: 'Annule',
    pending: 'En attente',
  }

  return labels[status] ?? 'En attente'
}

function formatPrice(value) {
  if (!value) {
    return 'Adoption / Gratuit'
  }

  return `${value} MAD`
}

function filterOrders(orders, searchTerm) {
  if (!searchTerm) {
    return orders
  }

  const normalizedSearch = normalizeSearchText(searchTerm)

  return orders.filter((order) => {
    const counterpart = order.isBuyer ? order.seller : order.buyer

    return [
      order.listing?.title,
      order.listing?.location,
      order.invoiceNumber,
      counterpart?.name,
      counterpart?.email,
      order.reservationStatus,
      order.deliveryStatus,
      order.paymentStatus,
      order.deliveryMethod,
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch))
  })
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default OrderHistoryPage
