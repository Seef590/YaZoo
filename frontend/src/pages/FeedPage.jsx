import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

import { getAnimalsRequest } from '../api/animals'
import { getCommunitiesRequest } from '../api/communities'
import {
  createCommentRequest,
  createPostRequest,
  getPostsRequest,
  toggleLikeRequest,
} from '../api/posts'
import { getProductsRequest } from '../api/products'
import { getProfileRequest } from '../api/profile'
import { getReservationsRequest } from '../api/reservations'
import {
  createStoryRequest,
  deleteStoryRequest,
  getStoriesRequest,
  markStoryViewedRequest,
} from '../api/stories'
import CreatePost from '../components/feed/CreatePost'
import PostCard from '../components/feed/PostCard'
import StoryComposerModal from '../components/feed/StoryComposerModal'
import StoryViewer from '../components/feed/StoryViewer'
import Avatar from '../components/ui/Avatar'
import ScrollTopButton from '../components/ui/ScrollTopButton'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'
import { normalizeProfileMediaPayload } from '../utils/media'

function FeedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [storyGroups, setStoryGroups] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [profileSummary, setProfileSummary] = useState(null)
  const [marketplaceHighlights, setMarketplaceHighlights] = useState([])
  const [communityHighlights, setCommunityHighlights] = useState([])
  const [reservationSummary, setReservationSummary] = useState({
    buyer: 0,
    seller: 0,
  })
  const [storyErrorMessage, setStoryErrorMessage] = useState('')
  const [storySuccessMessage, setStorySuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isStoriesLoading, setIsStoriesLoading] = useState(true)
  const [likePendingIds, setLikePendingIds] = useState([])
  const [activeStoryIndex, setActiveStoryIndex] = useState(null)
  const [isStoryComposerOpen, setIsStoryComposerOpen] = useState(false)
  const [isStorySubmitting, setIsStorySubmitting] = useState(false)
  const [isDeletingStoryId, setIsDeletingStoryId] = useState('')
  const viewingStoryIdsRef = useRef(new Set())

  const loadPosts = useCallback(async () => {
    try {
      const response = await getPostsRequest()

      setPosts(response.data.data)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de charger le feed.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSidebarData = useCallback(async () => {
    if (!user?.id) {
      setProfileSummary(null)
      setMarketplaceHighlights([])
      setCommunityHighlights([])
      setReservationSummary({ buyer: 0, seller: 0 })
      return
    }

    const [
      profileResult,
      animalsResult,
      productsResult,
      communitiesResult,
      reservationsResult,
    ] = await Promise.allSettled([
      getProfileRequest(user.id),
      getAnimalsRequest(),
      getProductsRequest(),
      getCommunitiesRequest(),
      getReservationsRequest(),
    ])

    if (profileResult.status === 'fulfilled') {
      setProfileSummary(
        normalizeProfileMediaPayload(profileResult.value.data.data),
      )
    }

    const animals = animalsResult.status === 'fulfilled'
      ? animalsResult.value.data.data ?? []
      : []
    const products = productsResult.status === 'fulfilled'
      ? productsResult.value.data.data ?? []
      : []
    const communities = communitiesResult.status === 'fulfilled'
      ? communitiesResult.value.data.data ?? []
      : []
    const reservations = reservationsResult.status === 'fulfilled'
      ? reservationsResult.value.data
      : {}

    setMarketplaceHighlights(
      buildMarketplaceHighlights(animals, products, user.id),
    )
    setCommunityHighlights(
      communities
        .filter((community) => community.isMember || community.isAdmin)
        .slice(0, 3),
    )
    setReservationSummary({
      buyer: reservations.buyerReservations?.length ?? 0,
      seller: reservations.sellerReservations?.length ?? 0,
    })
  }, [user?.id])

  const loadStories = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsStoriesLoading(true)
    }

    try {
      const response = await getStoriesRequest()

      setStoryGroups(response.data.data ?? [])
      setStoryErrorMessage('')
    } catch (error) {
      setStoryErrorMessage(
        getErrorMessage(error, 'Impossible de charger les stories.'),
      )
    } finally {
      if (!silent) {
        setIsStoriesLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadPosts()
    void loadStories()
    void loadSidebarData()
  }, [loadPosts, loadSidebarData, loadStories])

  useEffect(() => {
    if (!location.state?.openStoryComposer) {
      return
    }

    setIsStoryComposerOpen(true)
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
      },
    )
  }, [location.pathname, location.search, location.state, navigate])

  const handleCreatePost = async (payload) => {
    const response = await createPostRequest(payload)

    setPosts((current) => [response.data.data, ...current])
  }

  const handleToggleLike = async (postId) => {
    let previousPost = null

    setLikePendingIds((current) => [...current, postId])
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post
        }

        previousPost = post

        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
        }
      }),
    )

    try {
      const response = await toggleLikeRequest(postId)

      setPosts((current) =>
        current.map((post) => (post.id === postId ? response.data.data : post)),
      )
      setErrorMessage('')
    } catch (error) {
      if (previousPost) {
        setPosts((current) =>
          current.map((post) => (post.id === postId ? previousPost : post)),
        )
      }

      setErrorMessage(
        getErrorMessage(error, 'Impossible de mettre a jour le like.'),
      )

      throw error
    } finally {
      setLikePendingIds((current) => current.filter((id) => id !== postId))
    }
  }

  const handleCreateComment = async (postId, body) => {
    const response = await createCommentRequest(postId, { body })
    const comment = response.data.data

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, comment],
              commentsCount: (post.commentsCount ?? post.comments.length) + 1,
            }
          : post,
      ),
    )

    return comment
  }

  const handleCreateStory = async (payload) => {
    setIsStorySubmitting(true)
    setStoryErrorMessage('')
    setStorySuccessMessage('')

    try {
      await createStoryRequest(payload)
      setStorySuccessMessage('Story publiee avec succes pour 24 heures.')
      setIsStoryComposerOpen(false)
      await loadStories()
    } catch (error) {
      setStoryErrorMessage(
        getErrorMessage(error, 'Impossible de publier la story.'),
      )
      throw error
    } finally {
      setIsStorySubmitting(false)
    }
  }

  const handleOpenStory = (storyGroup) => {
    if (storyGroup.isComposerShortcut || (storyGroup.stories?.length ?? 0) === 0) {
      setIsStoryComposerOpen(true)
      return
    }

    const nextIndex = viewerStories.findIndex((group) => group.id === storyGroup.id)

    if (nextIndex >= 0) {
      setActiveStoryIndex(nextIndex)
    }
  }

  const handleStorySeen = useCallback(
    async (story) => {
      const storyId = String(story?.id ?? '')

      if (
        !storyId ||
        story.isOwn ||
        story.isViewed ||
        viewingStoryIdsRef.current.has(storyId)
      ) {
        return
      }

      viewingStoryIdsRef.current.add(storyId)

      try {
        const response = await markStoryViewedRequest(story.id)

        setStoryGroups((current) =>
          updateStoryInGroups(current, response.data.data),
        )
      } catch (error) {
        setStoryErrorMessage(
          getErrorMessage(error, 'Impossible de marquer la story comme vue.'),
        )
      } finally {
        viewingStoryIdsRef.current.delete(storyId)
      }
    },
    [],
  )

  const handleDeleteStory = async (story) => {
    if (!story?.id) {
      return
    }

    const confirmed = globalThis.confirm('Supprimer cette story maintenant ?')

    if (!confirmed) {
      return
    }

    setIsDeletingStoryId(String(story.id))
    setStoryErrorMessage('')
    setStorySuccessMessage('')

    try {
      await deleteStoryRequest(story.id)
      setActiveStoryIndex(null)
      setStorySuccessMessage('Story supprimee avec succes.')
      await loadStories({ silent: true })
    } catch (error) {
      setStoryErrorMessage(
        getErrorMessage(error, 'Impossible de supprimer cette story.'),
      )
    } finally {
      setIsDeletingStoryId('')
    }
  }

  const storyRowItems = useMemo(
    () => buildStoryRowItems(storyGroups, user),
    [storyGroups, user],
  )

  const viewerStories = useMemo(
    () => storyGroups.map((group) => mapStoryGroupForViewer(group)),
    [storyGroups],
  )
  const storyViewerKey = getStoryViewerKey(activeStoryIndex, viewerStories)
  const ownPosts = useMemo(
    () =>
      posts.filter((post) => String(post.author?.id) === String(user?.id)),
    [posts, user?.id],
  )
  const sidebarProfile = profileSummary ?? user ?? {}
  const sidebarName = sidebarProfile.name ?? user?.name ?? 'Utilisateur'
  const sidebarAvatar =
    sidebarProfile.avatar ?? user?.avatar ?? user?.cover_photo ?? ''
  const sidebarCity = sidebarProfile.city ?? user?.city ?? ''
  const sidebarCountry = sidebarProfile.country ?? user?.country ?? ''
  const sidebarLocation = [sidebarCity, sidebarCountry].filter(Boolean).join(', ')
  const sidebarPostsCount = profileSummary?.postsCount ?? ownPosts.length
  const sidebarFollowersCount = profileSummary?.followersCount ?? 0
  const sidebarFollowingCount = profileSummary?.followingCount ?? 0

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/88 p-4 shadow-[0_20px_48px_rgba(124,58,237,0.08)] backdrop-blur">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Stories
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Un clin d oeil a votre design feed, en version integree dans l app.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsStoryComposerOpen(true)}
            className="w-full rounded-full bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-100 sm:w-auto"
          >
            Partager
          </button>
        </div>

        {isStoriesLoading ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`story-skeleton-${index}`}
                className="min-w-[120px] animate-pulse rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.8))] p-4"
              >
                <div className="mx-auto h-[74px] w-[74px] rounded-full bg-violet-100" />
                <div className="mx-auto mt-3 h-3 w-20 rounded-full bg-violet-100" />
                <div className="mx-auto mt-2 h-2.5 w-16 rounded-full bg-violet-50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
            {storyRowItems.map((storyGroup) => (
              <StoryCard
                key={storyGroup.id}
                storyGroup={storyGroup}
                onOpen={() => handleOpenStory(storyGroup)}
                onAddStory={
                  storyGroup.isOwn && !storyGroup.isComposerShortcut
                    ? () => setIsStoryComposerOpen(true)
                    : null
                }
              />
            ))}
          </div>
        )}
      </section>

      {storyErrorMessage ? (
        <div role="alert" className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {storyErrorMessage}
        </div>
      ) : null}

      {storySuccessMessage ? (
        <div role="status" aria-live="polite" className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {storySuccessMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div role="alert" className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <CreatePost onCreate={handleCreatePost} />

          {isLoading ? (
            <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
              Chargement du feed...
            </div>
          ) : null}

          {!isLoading && posts.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500">
              Aucun post pour le moment. Creez le premier contenu YaZoo.
            </div>
          ) : null}

          {!isLoading ? (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onCreateComment={handleCreateComment}
                  onToggleLike={handleToggleLike}
                  isLikePending={likePendingIds.includes(post.id)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="hidden space-y-4 xl:block">
          <article className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] p-5 shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
            <div className="flex items-center gap-3">
              <Avatar
                name={sidebarName}
                src={sidebarAvatar}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-950">
                  {sidebarName}
                </p>
                <p className="truncate text-xs text-stone-500">
                  @{sidebarName.toLowerCase().replace(/\s+/g, '')}
                  {sidebarLocation ? ` - ${sidebarLocation}` : ''}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-stone-600">
              <div className="rounded-xl bg-violet-50 px-2 py-2">
                <p className="font-semibold text-stone-900">
                  {sidebarFollowingCount}
                </p>
                <p>Abonnements</p>
              </div>
              <div className="rounded-xl bg-violet-50 px-2 py-2">
                <p className="font-semibold text-stone-900">
                  {sidebarFollowersCount}
                </p>
                <p>Abonnes</p>
              </div>
              <div className="rounded-xl bg-violet-50 px-2 py-2">
                <p className="font-semibold text-stone-900">
                  {sidebarPostsCount}
                </p>
                <p>Posts</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-full border border-violet-100 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-violet-50"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-3 py-2 text-xs font-medium text-white transition hover:brightness-105"
              >
                Partager
              </button>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Mes publications
            </p>
            {ownPosts.slice(0, 3).map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => navigate('/profile')}
                className="mt-3 block w-full rounded-[18px] bg-violet-50/70 px-3 py-3 text-left text-sm text-stone-700 transition hover:bg-violet-100"
              >
                <span className="line-clamp-2">
                  {post.content || 'Publication avec media'}
                </span>
              </button>
            ))}
            {ownPosts.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Vos prochains posts apparaitront ici automatiquement.
              </p>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Marketplace
            </p>
            {marketplaceHighlights.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => navigate(item.href)}
                className="mt-3 block w-full rounded-[18px] bg-violet-50/70 px-3 py-3 text-left transition hover:bg-violet-100"
              >
                <p className="truncate text-sm font-medium text-stone-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {[item.priceLabel, item.location].filter(Boolean).join(' - ')}
                </p>
              </button>
            ))}
            {marketplaceHighlights.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Vos annonces animaux et produits s'afficheront ici apres publication.
              </p>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_18px_42px_rgba(124,58,237,0.08)]">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700">
              Activite
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-stone-600">
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="rounded-xl bg-violet-50 px-2 py-3 transition hover:bg-violet-100"
              >
                <p className="font-semibold text-stone-900">
                  {reservationSummary.buyer}
                </p>
                <p>Achats</p>
              </button>
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="rounded-xl bg-violet-50 px-2 py-3 transition hover:bg-violet-100"
              >
                <p className="font-semibold text-stone-900">
                  {reservationSummary.seller}
                </p>
                <p>Ventes</p>
              </button>
            </div>
            {communityHighlights.map((community) => (
              <button
                key={community.id}
                type="button"
                onClick={() => navigate('/communities')}
                className="mt-3 block w-full rounded-[18px] bg-violet-50/70 px-3 py-3 text-left transition hover:bg-violet-100"
              >
                <p className="truncate text-sm font-medium text-stone-900">
                  {community.name}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {community.membersCount ?? 0} membre
                  {(community.membersCount ?? 0) > 1 ? 's' : ''}
                </p>
              </button>
            ))}
            {communityHighlights.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Les communautes que vous rejoignez s'afficheront ici.
              </p>
            ) : null}
          </article>
        </aside>
      </div>

      {isStoryComposerOpen ? (
        <StoryComposerModal
          isOpen={isStoryComposerOpen}
          isSubmitting={isStorySubmitting}
          onClose={() => setIsStoryComposerOpen(false)}
          onSubmit={handleCreateStory}
        />
      ) : null}

      <StoryViewer
        key={storyViewerKey}
        stories={viewerStories}
        activeStoryIndex={activeStoryIndex}
        onChangeStory={setActiveStoryIndex}
        onClose={() => setActiveStoryIndex(null)}
        onStorySeen={handleStorySeen}
        onDeleteStory={handleDeleteStory}
        isDeletingStoryId={isDeletingStoryId}
      />

      <ScrollTopButton />
    </section>
  )
}

function StoryCard({ storyGroup, onOpen, onAddStory }) {
  const hasStories = (storyGroup.stories?.length ?? 0) > 0
  const ringClass = getStoryRingClass(storyGroup)
  const avatarName = storyGroup.user?.name ?? 'Votre story'
  const avatarSrc = storyGroup.user?.avatar ?? ''

  return (
    <article className="min-w-[118px] snap-start sm:min-w-[132px]">
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.8))] p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_36px_rgba(124,58,237,0.1)]"
      >
        <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center">
          <div
            className={`relative rounded-full p-[3px] shadow-[0_12px_26px_rgba(124,58,237,0.18)] ${ringClass}`}
          >
            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white p-[4px]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={avatarName}
                  className="h-[66px] w-[66px] rounded-full border border-white object-cover shadow-[0_10px_22px_rgba(124,58,237,0.18)]"
                />
              ) : (
                <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#c4b5fd,#d8b4fe,#f5d0fe)] text-sm font-semibold text-violet-950 shadow-[0_10px_22px_rgba(124,58,237,0.12)]">
                  {getStoryInitials(avatarName)}
                </span>
              )}
            </div>
            {storyGroup.isOwn ? (
              <span className="absolute bottom-[2px] right-[2px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(124,58,237,0.34)]">
                +
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm font-semibold text-stone-900">
          {storyGroup.title}
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {storyGroup.caption}
        </p>
      </button>

      {storyGroup.isOwn && hasStories && onAddStory ? (
        <button
          type="button"
          onClick={onAddStory}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-violet-50 px-3 py-2 text-[11px] font-medium text-violet-700 transition hover:bg-violet-100"
        >
          Ajouter une autre story
        </button>
      ) : null}
    </article>
  )
}

function buildStoryRowItems(storyGroups, user) {
  const ownGroup = storyGroups.find((group) => group.isOwn)
  const otherGroups = storyGroups.filter((group) => !group.isOwn)

  const normalizedOwnGroup = ownGroup ?? {
    id: `own-story-${user?.id ?? 'guest'}`,
    isOwn: true,
    hasUnviewed: false,
    user: user
      ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar ?? '',
          city: user.city ?? '',
          country: user.country ?? '',
        }
      : null,
    stories: [],
    isComposerShortcut: true,
  }

  return [
    {
      ...normalizedOwnGroup,
      title: 'Votre story',
      caption:
        (normalizedOwnGroup.stories?.length ?? 0) > 0
          ? `${normalizedOwnGroup.stories.length} story active`
          : 'Partager',
    },
    ...otherGroups.map((group) => ({
      ...group,
      title: group.user?.name ?? 'Story',
      caption: getStoryGroupCaption(group),
    })),
  ]
}

function getStoryViewerKey(activeStoryIndex, viewerStories) {
  if (activeStoryIndex === null) {
    return 'story-viewer-closed'
  }

  return viewerStories[activeStoryIndex]?.id ?? 'story-viewer-open'
}

function getStoryRingClass(storyGroup) {
  if (storyGroup.isOwn) {
    return 'bg-[linear-gradient(135deg,#7c3aed,#a855f7,#ddd6fe)]'
  }

  if (storyGroup.hasUnviewed) {
    return 'bg-[linear-gradient(135deg,#7c3aed,#9333ea,#f0abfc)]'
  }

  return 'bg-violet-100'
}

function getStoryGroupCaption(group) {
  if (group.hasUnviewed) {
    return 'Nouveau'
  }

  const storyCount = group.stories?.length ?? 0

  return `${storyCount} story${storyCount > 1 ? 's' : ''}`
}

function mapStoryGroupForViewer(group) {
  const title = group.isOwn ? 'Votre story' : group.user?.name ?? 'Story'

  return {
    id: group.id,
    title,
    caption: group.isOwn ? 'Publiee par vous' : `Story de ${group.user?.name ?? 'YaZoo'}`,
    slides: (group.stories ?? []).map((story) => ({
      id: story.id,
      title: story.content ? truncateText(story.content, 72) : title,
      body:
        story.content ||
        'Une story YaZoo partagee dans votre espace social pendant 24 heures.',
      authorName: group.user?.name ?? 'YaZoo',
      authorAvatar: group.user?.avatar ?? '',
      location: story.location ?? '',
      createdAt: story.createdAt ?? '',
      mediaUrl: story.mediaUrl ?? '',
      mediaKind: story.mediaKind ?? '',
      surfaceClass:
        story.mediaKind === 'video'
          ? 'bg-[linear-gradient(180deg,#581c87,#7c3aed,#d8b4fe)]'
          : 'bg-[linear-gradient(180deg,#6d28d9,#8b5cf6,#ddd6fe)]',
      tags: [],
      isOwn: story.isOwn,
      isViewed: story.isViewed,
      viewsCount: story.viewsCount ?? 0,
      viewers: story.viewers ?? [],
    })),
  }
}

function updateStoryInGroups(groups, nextStory) {
  return groups.map((group) => {
    const updatedStories = (group.stories ?? []).map((story) =>
      story.id === nextStory.id ? nextStory : story,
    )

    return {
      ...group,
      hasUnviewed: group.isOwn ? false : updatedStories.some((story) => !story.isViewed),
      stories: updatedStories,
    }
  })
}

function truncateText(text, maxLength) {
  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

function getStoryInitials(name) {
  if (!name) return 'YZ'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

StoryCard.propTypes = {
  storyGroup: PropTypes.object,
  onOpen: PropTypes.func,
  onAddStory: PropTypes.func,
}

function buildMarketplaceHighlights(animals, products, userId) {
  const ownAnimals = animals
    .filter((animal) => String(animal.author?.id) === String(userId) || animal.isOwner)
    .map((animal) => ({
      id: animal.id,
      kind: 'animal',
      title: animal.name,
      priceLabel: animal.isForAdoption ? 'Adoption' : `${animal.price ?? 0} MAD`,
      location: animal.location,
      createdAt: animal.createdAt,
      href: `/marketplace/animals/${animal.id}`,
    }))

  const ownProducts = products
    .filter((product) => String(product.author?.id) === String(userId) || product.isOwner)
    .map((product) => ({
      id: product.id,
      kind: 'product',
      title: product.name,
      priceLabel: `${product.price ?? 0} MAD`,
      location: product.location,
      createdAt: product.createdAt,
      href: `/marketplace/products/${product.id}`,
    }))

  return [...ownAnimals, ...ownProducts]
    .sort((first, second) => new Date(second.createdAt ?? 0) - new Date(first.createdAt ?? 0))
    .slice(0, 3)
}

export default FeedPage
