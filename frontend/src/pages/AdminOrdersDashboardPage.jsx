import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getAdminOrdersDashboardRequest } from '../api/admin'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

function AdminOrdersDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState({
    stats: {},
    activeOrders: [],
    recentCompletedOrders: [],
    topSellers: [],
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.isAdmin) {
      return undefined
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const response = await getAdminOrdersDashboardRequest()

        if (!cancelled) {
          setDashboard(response.data)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger le dashboard commandes."),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [user?.isAdmin])

  if (!user?.isAdmin) {
    return <Navigate to="/feed" replace />
  }

  const stats = dashboard.stats ?? {}
  const overviewStats = [
    { label: 'Commandes', value: stats.totalOrders ?? 0 },
    { label: 'En attente', value: stats.pendingReservations ?? 0 },
    { label: 'Approuvees', value: stats.approvedOrders ?? 0 },
    { label: 'Finalisees', value: stats.completedOrders ?? 0 },
    { label: 'CA total', value: formatPrice(stats.revenueTotal ?? 0) },
    { label: 'CA du mois', value: formatPrice(stats.revenueThisMonth ?? 0) },
    { label: 'En transit', value: stats.inTransitDeliveries ?? 0 },
    { label: 'Pretes / retrait', value: stats.readyForPickup ?? 0 },
    { label: 'A preparer', value: stats.deliveriesToPrepare ?? 0 },
    { label: 'Animaux', value: stats.animalOrders ?? 0 },
    { label: 'Produits', value: stats.productOrders ?? 0 },
    { label: 'Vendeurs actifs', value: stats.sellers ?? 0 },
  ]

  const refreshDashboard = async () => {
    setIsLoading(true)

    try {
      const response = await getAdminOrdersDashboardRequest()

      setDashboard(response.data)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de charger le dashboard commandes."),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.5),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              Pilotage commandes
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              Gardez revenus, logistique et vendeurs sous controle depuis un tableau de bord clair.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Les blocs de synthese, les listes de commandes et le classement
              vendeurs gardent les priorites bien visibles, tout en s integrant
              dans une presentation plus claire, plus sure et plus professionnelle.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Actives" value={dashboard.activeOrders?.length ?? 0} />
            <HeroStatCard label="Finalisees" value={stats.completedOrders ?? 0} />
            <HeroStatCard label="CA du mois" value={formatPrice(stats.revenueThisMonth ?? 0)} />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Vue globale
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Dashboard commandes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Une vue globale pour arbitrer plus vite et garder chaque flux sous controle.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/admin/moderation"
              className="inline-flex w-full items-center justify-center rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:w-auto"
            >
              Voir la moderation
            </Link>
            <Button type="button" variant="ghost" onClick={refreshDashboard} className="w-full sm:w-auto">
              Actualiser
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((entry) => (
            <StatCard key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
                Priorites
              </p>
              <h3 className="mt-2 text-lg font-semibold text-stone-950">
                Commandes a traiter
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Priorite aux reservations actives et a la logistique.
              </p>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              {dashboard.activeOrders?.length ?? 0} actives
            </span>
          </div>

          {isLoading ? (
            <StateBox>Chargement des commandes actives...</StateBox>
          ) : null}

          {!isLoading && !(dashboard.activeOrders?.length > 0) ? (
            <StateBox>Aucune commande active a surveiller pour le moment.</StateBox>
          ) : null}

          {!isLoading && dashboard.activeOrders?.length > 0 ? (
            <div className="mt-5 space-y-4">
              {dashboard.activeOrders.map((order) => (
                <OrderCard key={`active-${order.id}`} order={order} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
            Performances
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-950">Top vendeurs</h3>
          <p className="mt-1 text-sm text-stone-500">
            Classement par chiffre d'affaires des commandes finalisees.
          </p>

          {isLoading ? <StateBox>Calcul des performances...</StateBox> : null}

          {!isLoading && !(dashboard.topSellers?.length > 0) ? (
            <StateBox>Aucun vendeur classe pour le moment.</StateBox>
          ) : null}

          {!isLoading && dashboard.topSellers?.length > 0 ? (
            <div className="mt-5 space-y-3">
              {dashboard.topSellers.map((entry, index) => (
                <article
                  key={`seller-${entry.seller?.id ?? index}`}
                  className="rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.78))] px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]">
                      {index + 1}
                    </div>
                    <Avatar name={entry.seller?.name ?? 'Vendeur'} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">
                        {entry.seller?.name ?? 'Vendeur inconnu'}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {entry.seller?.email ?? 'Email indisponible'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniStat
                      label="CA total"
                      value={formatPrice(entry.revenueTotal ?? 0)}
                    />
                    <MiniStat
                      label="Commandes"
                      value={entry.completedOrders ?? 0}
                    />
                    <MiniStat
                      label="Panier moyen"
                      value={formatPrice(entry.averageOrderValue ?? 0)}
                    />
                    <MiniStat
                      label="Ville"
                      value={entry.seller?.city || 'Non renseignee'}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Historique recent
            </p>
            <h3 className="mt-2 text-lg font-semibold text-stone-950">
              Commandes finalisees recentes
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Historique rapide pour verifier factures et execution.
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            {stats.completedOrders ?? 0} finalisees
          </span>
        </div>

        {isLoading ? <StateBox>Chargement des commandes finalisees...</StateBox> : null}

        {!isLoading && !(dashboard.recentCompletedOrders?.length > 0) ? (
          <StateBox>Aucune commande finalisee pour le moment.</StateBox>
        ) : null}

        {!isLoading && dashboard.recentCompletedOrders?.length > 0 ? (
          <div className="mt-5 space-y-4">
            {dashboard.recentCompletedOrders.map((order) => (
              <OrderCard key={`completed-${order.id}`} order={order} showInvoice />
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}

function StateBox({ children }) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-10 text-center text-sm text-stone-500">
      {children}
    </div>
  )
}

function OrderCard({ order, showInvoice = false }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      {order.listing?.imageUrl ? (
        <div className="h-48 bg-stone-200">
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
              <Badge tone="primary">{formatReservationKind(order.kind)}</Badge>
              <Badge tone="soft">{formatReservationStatus(order.reservationStatus)}</Badge>
              <Badge tone="light">{formatDeliveryStatus(order.deliveryStatus)}</Badge>
            </div>
            <h4 className="mt-3 text-lg font-semibold text-stone-950">
              {order.listing?.title ?? 'Annonce'}
            </h4>
            <p className="mt-1 text-sm text-stone-500">
              Creee le {formatDate(order.createdAt)}
              {order.completedAt ? ` | Finalisee le ${formatDate(order.completedAt)}` : ''}
            </p>
          </div>

          <div className="rounded-[22px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.1),_rgba(216,180,254,0.22),_rgba(255,255,255,0.94))] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
              Total
            </p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {formatPrice(order.grandTotal ?? 0)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <PersonCard label="Acheteur" person={order.buyer} />
          <PersonCard label="Vendeur" person={order.seller} />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Paiement" value={formatPaymentStatus(order.paymentStatus)} />
          <MiniStat label="Mode" value={formatDeliveryMethod(order.deliveryMethod)} />
          <MiniStat label="Quantite" value={order.quantity ?? 0} />
          <MiniStat label="Lieu" value={order.listing?.location || 'Non renseigne'} />
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {order.listing?.routePath ? (
            <Link
              to={order.listing.routePath}
              className="inline-flex w-full items-center justify-center rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:w-auto"
            >
              Voir l'annonce
            </Link>
          ) : null}

          {showInvoice && order.invoiceNumber ? (
            <Link
              to={`/reservations/${order.id}/invoice`}
              className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:w-auto"
            >
              Voir la facture
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function PersonCard({ label, person }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 shadow-sm">
      <Avatar name={person?.name ?? label} size="sm" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
        <p className="truncate text-sm font-medium text-stone-900">
          {person?.name ?? `${label} inconnu`}
        </p>
        <p className="truncate text-xs text-stone-500">
          {person?.email ?? 'Email indisponible'}
        </p>
      </div>
    </div>
  )
}

function Badge({ children, tone = 'soft' }) {
  const classes = {
    primary: 'bg-[linear-gradient(135deg,#7c3aed,#a855f7)] text-white',
    soft: 'bg-violet-50 text-violet-800',
    light: 'bg-white/90 text-stone-700 ring-1 ring-inset ring-violet-100',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes[tone]}`}>
      {children}
    </span>
  )
}

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatReservationKind(kind) {
  const labels = {
    animal: 'Animal',
    product: 'Produit',
  }

  return labels[kind] ?? 'Annonce'
}

function formatReservationStatus(status) {
  const labels = {
    pending: 'En attente',
    approved: 'Approuvee',
    completed: 'Finalisee',
    cancelled: 'Annulee',
    rejected: 'Refusee',
  }

  return labels[status] ?? 'Commande'
}

function formatDeliveryStatus(status) {
  const labels = {
    pending: 'En attente',
    preparing: 'Preparation',
    ready_for_pickup: 'Pret au retrait',
    shipped: 'En transit',
    delivered: 'Livree',
    picked_up: 'Retiree',
  }

  return labels[status] ?? 'Livraison'
}

function formatPaymentStatus(status) {
  const labels = {
    pending: 'En attente',
    paid: 'Paye',
    cancelled: 'Annule',
  }

  return labels[status] ?? 'Paiement'
}

function formatDeliveryMethod(method) {
  return method === 'pickup' ? 'Retrait' : 'Livraison'
}

export default AdminOrdersDashboardPage
