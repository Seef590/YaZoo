import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getReservationInvoiceRequest } from '../api/reservations'
import Button from '../components/ui/Button'
import { useI18n } from '../hooks/useI18n'
import { getErrorMessage } from '../utils/getErrorMessage'

function InvoicePage() {
  const { t } = useI18n()
  const { reservationId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadInvoice = async () => {
      try {
        const response = await getReservationInvoiceRequest(reservationId)

        if (!cancelled) {
          setInvoice(response.data.data)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, t('invoice.loadError')),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInvoice()

    return () => {
      cancelled = true
    }
  }, [reservationId, t])

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-16 text-center text-sm text-stone-500">
        Chargement de la facture...
      </section>
    )
  }

  if (errorMessage || !invoice) {
    return (
      <section className="space-y-4">
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage || 'Facture introuvable.'}
        </div>
        <LinkButton to="/orders/history" variant="secondary">
          Retour a l'historique
        </LinkButton>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:flex sm:flex-wrap print:hidden">
        <LinkButton to="/orders/history" variant="ghost" className="w-full sm:w-auto">
          Retour a l'historique
        </LinkButton>
        <Button type="button" onClick={() => globalThis.print()} className="w-full sm:w-auto">
          Imprimer la facture
        </Button>
      </div>

      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.52),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] print:bg-white print:shadow-none sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              {t('invoice.title')} YaZoo
            </p>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              {t('invoice.title')} {invoice.invoiceNumber}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Un recapitulatif clair et professionnel de la commande, de la livraison et des montants.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Date" value={formatInvoiceDate(invoice.invoiceIssuedAt)} />
            <HeroStatCard label="Paiement" value={formatPaymentMethod(invoice.paymentMethod)} />
            <HeroStatCard label={t('common.totalVat')} value={formatPrice(invoice.grandTotal)} />
          </div>
        </div>
      </section>

      <article className="rounded-[30px] border border-white/80 bg-white/96 p-4 shadow-[0_20px_48px_rgba(124,58,237,0.08)] print:border-stone-200 print:bg-white print:shadow-none sm:rounded-[32px] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-violet-100 pb-6 print:border-stone-200">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-violet-700">
              YaZoo
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">{t('invoice.title')}</h2>
            <p className="mt-2 text-sm text-stone-500">
              Numero: {invoice.invoiceNumber}
            </p>
          </div>

          <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.1),_rgba(216,180,254,0.22),_rgba(255,255,255,0.94))] px-5 py-4 text-right print:bg-stone-100">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
              Date de facture
            </p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {formatInvoiceDate(invoice.invoiceIssuedAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title={t('invoice.buyer')}>
            <Detail label="Nom" value={invoice.buyer.name} />
            <Detail label="Email" value={invoice.buyer.email} />
            <Detail label="Telephone" value={invoice.buyer.phone || 'Non renseigne'} />
            <Detail
              label="Localisation"
              value={[invoice.buyer.city, invoice.buyer.country].filter(Boolean).join(', ') || 'Non renseignee'}
            />
          </Panel>

          <Panel title={t('invoice.seller')}>
            <Detail label="Nom" value={invoice.seller.name} />
            <Detail label="Email" value={invoice.seller.email} />
            <Detail label="Telephone" value={invoice.seller.phone || 'Non renseigne'} />
            <Detail
              label="Localisation"
              value={[invoice.seller.city, invoice.seller.country].filter(Boolean).join(', ') || 'Non renseignee'}
            />
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title={t('invoice.order')}>
            <Detail label="Annonce" value={invoice.listing.title} />
            <Detail label="Type" value={invoice.listing.kind === 'animal' ? 'Animal' : 'Produit'} />
            <Detail label="Quantite" value={invoice.quantity} />
            <Detail label="Paiement" value={formatPaymentMethod(invoice.paymentMethod)} />
            <Detail label="Livraison" value={formatDeliveryMethod(invoice.deliveryMethod)} />
            <Detail label="Statut livraison" value={formatDeliveryStatus(invoice.deliveryStatus)} />
          </Panel>

          <Panel title={t('invoice.delivery')}>
            <Detail label="Contact" value={invoice.delivery.contactName || 'Non renseigne'} />
            <Detail label="Telephone" value={invoice.delivery.phone || 'Non renseigne'} />
            <Detail label="Ville" value={invoice.delivery.city || 'Non renseignee'} />
            <Detail label="Adresse" value={invoice.delivery.address || 'Retrait sur place'} />
            <Detail label="Notes" value={invoice.delivery.notes || 'Aucune note'} />
          </Panel>
        </div>

        <div className="mt-6 rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.82))] p-5 print:border-stone-200 print:bg-white">
          <h3 className="text-lg font-semibold text-stone-950">{t('invoice.amounts')}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <AmountCard label="Sous-total" value={invoice.subtotal} />
            <AmountCard label="Livraison" value={invoice.deliveryFee} />
            <AmountCard label="Total TTC" value={invoice.grandTotal} accent />
          </div>
        </div>
      </article>
    </section>
  )
}

function HeroStatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-white/88 px-4 py-4 shadow-sm print:border-stone-200 print:bg-white print:shadow-none">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[28px] border border-violet-100 bg-white/88 p-5 print:border-stone-200 print:bg-white">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-3 print:bg-stone-100">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}

function AmountCard({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-[24px] px-4 py-4 ${
        accent
          ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white print:bg-stone-900'
          : 'bg-white text-stone-900 ring-1 ring-inset ring-violet-100 print:border print:border-stone-200 print:ring-0'
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.16em] ${accent ? 'text-violet-50' : 'text-stone-500'}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{formatPrice(value)}</p>
    </div>
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

function formatInvoiceDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatPaymentMethod(method) {
  return method === 'bank_transfer' ? 'Virement bancaire' : 'Paiement a la remise'
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

export default InvoicePage
