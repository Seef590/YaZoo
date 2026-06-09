import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getProductRequest } from '../api/products'
import { createProductReservationRequest } from '../api/reservations'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

function ProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [reservationError, setReservationError] = useState('')
  const [reservationSuccess, setReservationSuccess] = useState('')
  const [reservationForm, setReservationForm] = useState({
    quantity: 1,
    delivery_method: 'pickup',
    delivery_contact_name: '',
    delivery_phone: '',
    delivery_city: '',
    delivery_address: '',
    delivery_notes: '',
    payment_method: 'cash_on_pickup',
    note: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false)

  const loadProduct = async ({ silent = false } = {}) => {
    try {
      const response = await getProductRequest(productId)

      setProduct(response.data.data)
      setErrorMessage('')
    } catch (error) {
      if (!silent) {
        setErrorMessage(
          getErrorMessage(error, "Impossible de charger cette annonce produit."),
        )
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const response = await getProductRequest(productId)

        if (!cancelled) {
          setProduct(response.data.data)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger cette annonce produit."),
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
  }, [productId])

  const gallery = useMemo(
    () => uniqueUrls([product?.imageUrl, ...(product?.galleryUrls ?? [])]),
    [product],
  )

  if (isLoading) {
    return <StateBox>Chargement de l'annonce...</StateBox>
  }

  if (errorMessage || !product) {
    return (
      <section className="space-y-4">
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage || 'Annonce introuvable.'}
        </div>
        <LinkButton to="/marketplace/products" variant="secondary">
          Retour au marketplace produits
        </LinkButton>
      </section>
    )
  }

  const canReserve = !product.isOwner && product.listingStatus === 'available'

  const handleReservationChange = (field) => (event) => {
    setReservationForm((current) => ({
      ...current,
      [field]:
        field === 'quantity' ? Number(event.target.value) || 1 : event.target.value,
    }))
  }

  const handleReservationSubmit = async (event) => {
    event.preventDefault()
    setReservationError('')
    setReservationSuccess('')
    setIsSubmittingReservation(true)

    try {
      await createProductReservationRequest(product.id, reservationForm)
      setReservationSuccess(
        'Demande de reservation envoyee. Vous pouvez suivre la suite dans Reservations.',
      )
      setReservationForm({
        quantity: 1,
        delivery_method: 'pickup',
        delivery_contact_name: '',
        delivery_phone: '',
        delivery_city: '',
        delivery_address: '',
        delivery_notes: '',
        payment_method: 'cash_on_pickup',
        note: '',
      })
      await loadProduct({ silent: true })
    } catch (error) {
      setReservationError(
        getErrorMessage(error, "Impossible d'envoyer la reservation."),
      )
    } finally {
      setIsSubmittingReservation(false)
    }
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.52),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <div className="flex flex-wrap gap-3">
              <LinkButton to="/marketplace/products" variant="ghost">
                Retour aux produits
              </LinkButton>
              {!product.isOwner && product.author?.email ? (
                <LinkButton to={buildProductContactPath(product)} variant="secondary">
                  Contacter le vendeur
                </LinkButton>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Chip tone="dark">{formatProductStatus(product.listingStatus)}</Chip>
              <Chip>{formatProductCategory(product.category)}</Chip>
              <Chip>{formatCondition(product.conditionStatus)}</Chip>
            </div>

            <h1 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Publie le {formatDate(product.createdAt)}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              {product.description || 'Une fiche produit presentee pour rassurer, informer et donner envie de passer a l action.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Prix" value={`${product.price} MAD`} />
            <HeroStatCard label="Stock" value={product.stock} />
            <HeroStatCard label="Ville" value={product.location || 'Non renseignee'} />
          </div>
        </div>
      </section>

      <article className="overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-[0_20px_48px_rgba(124,58,237,0.08)] sm:rounded-[32px]">
        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-violet-100/70 shadow-sm">
              {gallery[0] ? (
                <img
                  src={gallery[0]}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-[280px] w-full object-cover sm:h-[360px]"
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center bg-[linear-gradient(135deg,_rgba(124,58,237,0.14),_rgba(216,180,254,0.22),_rgba(255,255,255,0.92))] text-sm font-medium text-violet-700 sm:h-[360px]">
                  Image a ajouter
                </div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gallery.slice(1, 5).map((imageUrl) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-full rounded-[22px] object-cover ring-1 ring-inset ring-violet-100"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(124,58,237,0.1),_rgba(216,180,254,0.22),_rgba(255,255,255,0.94))] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                Prix
              </p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">
                {product.price} MAD
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Info label="Categorie" value={formatProductCategory(product.category)} />
              <Info label="Etat" value={formatCondition(product.conditionStatus)} />
              <Info label="Statut" value={formatProductStatus(product.listingStatus)} />
              <Info label="Stock" value={product.stock} />
              <Info label="Ville" value={product.location} />
              <Info label="Publie" value={formatDate(product.createdAt)} />
            </div>

            <div className="rounded-[24px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] p-4">
              <p className="text-sm font-semibold text-stone-950">Vendeur</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={product.author.name} />
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {product.author.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {[product.author.city, product.author.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {!product.isOwner ? (
              <div className="space-y-4 rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,239,255,0.82))] p-4 pb-24 lg:pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">
                      Reservation
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Reservez le produit puis suivez la validation et le statut de paiement.
                    </p>
                  </div>

                  {product.author?.email ? (
                    <LinkButton to={buildProductContactPath(product)} variant="ghost">
                      Envoyer un message prive
                    </LinkButton>
                  ) : null}
                </div>

                {reservationError ? (
                  <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {reservationError}
                  </div>
                ) : null}

                {reservationSuccess ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {reservationSuccess}
                  </div>
                ) : null}

                {canReserve ? (
                  <form onSubmit={handleReservationSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">
                          Quantite
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={Math.max(1, product.stock)}
                          value={reservationForm.quantity}
                          onChange={handleReservationChange('quantity')}
                          className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">
                          Mode de retrait
                        </span>
                        <select
                          value={reservationForm.delivery_method}
                          onChange={handleReservationChange('delivery_method')}
                          className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                        >
                          <option value="pickup">Retrait sur place</option>
                          <option value="delivery">Livraison</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">
                          Mode de paiement
                        </span>
                        <select
                          value={reservationForm.payment_method}
                          onChange={handleReservationChange('payment_method')}
                          className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                        >
                          <option value="cash_on_pickup">Paiement a la remise</option>
                          <option value="bank_transfer">Virement bancaire</option>
                        </select>
                      </label>
                    </div>

                    {reservationForm.delivery_method === 'delivery' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Nom du contact"
                          value={reservationForm.delivery_contact_name}
                          onChange={handleReservationChange('delivery_contact_name')}
                        />
                        <Field
                          label="Telephone"
                          value={reservationForm.delivery_phone}
                          onChange={handleReservationChange('delivery_phone')}
                        />
                        <Field
                          label="Ville"
                          value={reservationForm.delivery_city}
                          onChange={handleReservationChange('delivery_city')}
                        />
                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm font-medium text-stone-700">
                            Adresse
                          </span>
                          <textarea
                            rows={3}
                            value={reservationForm.delivery_address}
                            onChange={handleReservationChange('delivery_address')}
                            className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                            placeholder="Adresse complete de livraison"
                          />
                        </label>
                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm font-medium text-stone-700">
                            Instructions de livraison
                          </span>
                          <textarea
                            rows={3}
                            value={reservationForm.delivery_notes}
                            onChange={handleReservationChange('delivery_notes')}
                            className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                            placeholder="Acces, horaires, indications..."
                          />
                        </label>
                      </div>
                    ) : null}

                    <div className="rounded-[20px] bg-violet-50 px-4 py-3 text-sm text-violet-900">
                      Total estime: {formatProductReservationTotal(
                        product,
                        reservationForm.quantity,
                        reservationForm.delivery_method,
                      )} MAD
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">
                        Note pour le vendeur
                      </span>
                      <textarea
                        rows={4}
                        value={reservationForm.note}
                        onChange={handleReservationChange('note')}
                        className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
                        placeholder="Precision sur la livraison, disponibilite, questions..."
                      />
                    </label>

                    <div className="grid gap-3 sm:flex sm:flex-wrap">
                      <Button type="submit" disabled={isSubmittingReservation} className="w-full sm:w-auto">
                        {isSubmittingReservation ? 'Envoi...' : 'Reserver ce produit'}
                      </Button>
                      <LinkButton to="/reservations" variant="secondary" className="w-full sm:w-auto">
                        Voir mes reservations
                      </LinkButton>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-[20px] border border-violet-100 bg-white/84 px-4 py-3 text-sm text-stone-600">
                    Ce produit n'est pas reservable pour le moment.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[24px] border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm text-violet-900">
                Vous etes le proprietaire de cette annonce.
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}

function StateBox({ children }) {
  return (
    <section className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-16 text-center text-sm text-stone-500">
      {children}
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

function buildProductContactPath(product) {
  const message = `Bonjour, je vous contacte a propos de votre produit "${product.name}". Est-il toujours disponible ?`

  return `/messages?email=${encodeURIComponent(product.author.email)}&message=${encodeURIComponent(message)}`
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

function Chip({ children, tone = 'light' }) {
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

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <input
        className="w-full rounded-[22px] border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-300"
        {...props}
      />
    </label>
  )
}

function uniqueUrls(urls) {
  return [...new Set(urls.filter(Boolean))]
}

function formatProductCategory(category) {
  const labels = {
    food: 'Alimentation',
    toy: 'Jouets',
    accessory: 'Accessoires',
    hygiene: 'Hygiene',
    health: 'Sante',
    habitat: 'Habitat',
    other: 'Autres',
  }

  return labels[category] ?? 'Autres'
}

function formatProductStatus(status) {
  const labels = {
    available: 'Disponible',
    reserved: 'Reserve',
    sold: 'Vendu',
  }

  return labels[status] ?? 'Disponible'
}

function formatCondition(conditionStatus) {
  return conditionStatus === 'used' ? 'Occasion' : 'Neuf'
}

function formatProductReservationTotal(product, quantity, deliveryMethod) {
  const basePrice = Number(product.price ?? 0) * Number(quantity || 1)
  const deliveryFee =
    deliveryMethod === 'delivery'
      ? 35 + Math.max(0, Number(quantity || 1) - 1) * 5
      : 0

  return basePrice + deliveryFee
}

export default ProductDetailPage
