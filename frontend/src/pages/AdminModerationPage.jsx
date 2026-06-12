import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import {
  deleteAdminAnimalRequest,
  deleteAdminCommunityRequest,
  deleteAdminPostRequest,
  deleteAdminProductRequest,
  getAdminModerationRequest,
} from '../api/admin'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

const moderationTabs = [
  { key: 'posts', label: 'Feed' },
  { key: 'animals', label: 'Animaux' },
  { key: 'products', label: 'Produits' },
  { key: 'communities', label: 'Communautes' },
]

function AdminModerationPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState({
    stats: {},
    posts: [],
    animals: [],
    products: [],
    communities: [],
  })
  const [activeTab, setActiveTab] = useState('posts')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState('')

  useEffect(() => {
    if (!user?.isAdmin) {
      return undefined
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const response = await getAdminModerationRequest()

        if (!cancelled) {
          setDashboard(response.data)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger l'espace de moderation."),
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

  const items = dashboard[activeTab] ?? []
  const stats = dashboard.stats ?? {}
  const overviewStats = [
    { label: 'Utilisateurs', value: stats.users ?? 0 },
    { label: 'Admins', value: stats.admins ?? 0 },
    { label: 'Posts', value: stats.posts ?? 0 },
    { label: 'Animaux', value: stats.animals ?? 0 },
    { label: 'Produits', value: stats.products ?? 0 },
    { label: 'Communautes', value: stats.communities ?? 0 },
    {
      label: 'Demandes privees',
      value: stats.pendingCommunityRequests ?? 0,
    },
  ]

  const loadDashboard = async () => {
    try {
      const response = await getAdminModerationRequest()

      setDashboard(response.data)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de charger l'espace de moderation."),
      )
    }
  }

  const handleDelete = async (type, item) => {
    const confirmed = globalThis.confirm(
      `Voulez-vous vraiment supprimer ${buildDeleteLabel(type, item)} ?`,
    )

    if (!confirmed) {
      return
    }

    setDeletingKey(`${type}-${item.id}`)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (type === 'posts') {
        await deleteAdminPostRequest(item.id)
      }

      if (type === 'animals') {
        await deleteAdminAnimalRequest(item.id)
      }

      if (type === 'products') {
        await deleteAdminProductRequest(item.id)
      }

      if (type === 'communities') {
        await deleteAdminCommunityRequest(item.id)
      }

      setSuccessMessage(`${buildDeleteLabel(type, item)} a ete supprime avec succes.`)
      await loadDashboard()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de supprimer ce contenu.'),
      )
    } finally {
      setDeletingKey('')
    }
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(221,214,254,0.5),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(247,241,255,0.9)_48%,_rgba(237,233,254,0.84)_100%)] p-5 shadow-[0_24px_60px_rgba(124,58,237,0.1)] sm:rounded-[32px] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              Moderation admin
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl">
              Pilotez la qualite de YaZoo dans un espace admin plus net, plus rapide et plus rassurant.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Les indicateurs cles, les onglets de moderation et les contenus
              a verifier restent regroupes pour prendre les bonnes decisions rapidement.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroStatCard label="Contenus" value={items.length} />
            <HeroStatCard label="Posts" value={stats.posts ?? 0} />
            <HeroStatCard label="Demandes privees" value={stats.pendingCommunityRequests ?? 0} />
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Vue d ensemble
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Suivi global du contenu publie
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Vue rapide sur les volumes, les roles et les demandes a traiter.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/admin/orders"
              className="inline-flex w-full items-center justify-center rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:w-auto"
            >
              Dashboard commandes
            </Link>
            <Button type="button" variant="ghost" onClick={loadDashboard} className="w-full sm:w-auto">
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

      <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)]">
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {moderationTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                activeTab === tab.key
                  ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#c4b5fd)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.18)]'
                  : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <StateBox>Chargement des contenus a moderer...</StateBox>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <StateBox>Aucun contenu a afficher dans cette section.</StateBox>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <ModerationCard
                key={`${activeTab}-${item.id}`}
                item={item}
                type={activeTab}
                isDeleting={deletingKey === `${activeTab}-${item.id}`}
                onDelete={handleDelete}
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
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

function ModerationCard({ item, type, onDelete, isDeleting }) {
  const imageUrl = item.imageUrl ?? null
  const mediaUrl = item.mediaUrl ?? null
  const mediaKind = item.mediaKind ?? null
  const meta = buildMeta(type, item)

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.9))] shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
      {imageUrl ? (
        <div className="h-44 bg-stone-200 sm:h-48">
          <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
        </div>
      ) : null}

      {!imageUrl && mediaKind === 'video' && mediaUrl ? (
        <div className="h-44 bg-stone-950 sm:h-48">
          <video
            src={mediaUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <TypeBadge type={type} />
            <h3 className="mt-3 text-lg font-semibold text-stone-950">{item.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{formatDate(item.createdAt)}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => onDelete(type, item)}
            className="w-full border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-rose-200 sm:w-auto"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 shadow-sm">
          <Avatar
            name={item.author?.name ?? 'Auteur'}
            src={item.author?.avatar ?? ''}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">
              {item.author?.name ?? 'Auteur inconnu'}
            </p>
            <p className="truncate text-xs text-stone-500">
              {item.author?.email ?? 'Email indisponible'}
            </p>
          </div>
        </div>

        {item.content ? (
          <p className="text-sm leading-6 text-stone-600">{item.content}</p>
        ) : null}

        {item.description ? (
          <p className="text-sm leading-6 text-stone-600">{item.description}</p>
        ) : null}

        {mediaKind === 'video' ? (
          <div className="rounded-full bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
            Media video attache au post
          </div>
        ) : null}

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/92 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {meta.map((entry) => (
            <div
              key={entry.label}
              className="rounded-[20px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                {entry.label}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-900">
                {entry.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function TypeBadge({ type }) {
  const labels = {
    posts: 'Feed',
    animals: 'Animal',
    products: 'Produit',
    communities: 'Communaute',
  }

  const tones = {
    posts: 'bg-violet-100 text-violet-800',
    animals: 'bg-fuchsia-100 text-fuchsia-800',
    products: 'bg-purple-100 text-purple-800',
    communities: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        tones[type] ?? 'bg-violet-100 text-violet-800'
      }`}
    >
      {labels[type] ?? 'Contenu'}
    </span>
  )
}

function buildMeta(type, item) {
  if (type === 'posts') {
    return [
      { label: 'Likes', value: item.likes ?? 0 },
      { label: 'Commentaires', value: item.commentsCount ?? 0 },
      { label: 'Lieu', value: item.location || 'Non renseigne' },
    ]
  }

  if (type === 'animals') {
    return [
      { label: 'Categorie', value: formatAnimalCategory(item.category) },
      { label: 'Statut', value: formatListingStatus(item.listingStatus) },
      { label: 'Mode', value: item.isForAdoption ? 'Adoption' : `${item.price ?? 0} MAD` },
      { label: 'Lieu', value: item.location || 'Non renseigne' },
    ]
  }

  if (type === 'products') {
    return [
      { label: 'Categorie', value: formatProductCategory(item.category) },
      { label: 'Statut', value: formatListingStatus(item.listingStatus) },
      { label: 'Etat', value: item.conditionStatus === 'used' ? 'Occasion' : 'Neuf' },
      { label: 'Prix', value: `${item.price ?? 0} MAD` },
    ]
  }

  return [
    { label: 'Visibilite', value: item.isPrivate ? 'Privee' : 'Publique' },
    { label: 'Membres', value: item.membersCount ?? 0 },
    { label: 'Demandes', value: item.pendingRequestsCount ?? 0 },
  ]
}

function buildDeleteLabel(type, item) {
  if (type === 'posts') {
    return 'ce post'
  }

  if (type === 'animals') {
    return `l'annonce animal "${item.title}"`
  }

  if (type === 'products') {
    return `le produit "${item.title}"`
  }

  return `la communaute "${item.title}"`
}

function formatAnimalCategory(category) {
  const labels = {
    dog: 'Chiens',
    cat: 'Chats',
    bird: 'Oiseaux',
    fish: 'Poissons',
    rabbit: 'Lapins',
    reptile: 'Reptiles',
    other: 'Autres',
  }

  return labels[category] ?? 'Autres'
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

function formatListingStatus(status) {
  const labels = {
    available: 'Disponible',
    reserved: 'Reserve',
    adopted: 'Adopte',
    sold: 'Vendu',
  }

  return labels[status] ?? 'Disponible'
}

export default AdminModerationPage
