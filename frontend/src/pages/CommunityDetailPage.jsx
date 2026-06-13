import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'

import {
  getCommunityRequest,
  joinCommunityRequest,
  leaveCommunityRequest,
} from '../api/communities'
import {
  createCommentRequest,
  createPostRequest,
  deletePostRequest,
  getPostsRequest,
  reactToCommentRequest,
  toggleLikeRequest,
  updatePostRequest,
} from '../api/posts'
import CreatePost from '../components/feed/CreatePost'
import PostCard from '../components/feed/PostCard'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { asArray, extractDataArray, extractDataObject } from '../utils/apiData'
import { formatDate } from '../utils/formatDate'
import { getErrorMessage } from '../utils/getErrorMessage'

const COMMUNITY_TABS = [
  { key: 'about', label: 'A propos' },
  { key: 'discussion', label: 'Discussion' },
  { key: 'members', label: 'Membres' },
  { key: 'media', label: 'Medias' },
]

function CommunityDetailPage() {
  const { communityId } = useParams()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPostsLoading, setIsPostsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [likePendingIds, setLikePendingIds] = useState([])
  const [activeTab, setActiveTab] = useState('discussion')

  const loadCommunity = useCallback(async () => {
    try {
      const response = await getCommunityRequest(communityId)
      setCommunity(extractDataObject(response, null))
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de charger ce groupe.'))
    } finally {
      setIsLoading(false)
    }
  }, [communityId])

  const loadCommunityPosts = useCallback(async () => {
    setIsPostsLoading(true)

    try {
      const response = await getPostsRequest({ community_id: communityId })
      setPosts(extractDataArray(response))
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de charger les posts du groupe.'))
      setPosts([])
    } finally {
      setIsPostsLoading(false)
    }
  }, [communityId])

  useEffect(() => {
    void loadCommunity()
    void loadCommunityPosts()
  }, [loadCommunity, loadCommunityPosts])

  const handleJoin = async () => {
    setIsJoining(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await joinCommunityRequest(community.id)
      setCommunity(extractDataObject(response, community))
      setSuccessMessage(response.data.message)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible de rejoindre ce groupe."))
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    setIsJoining(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await leaveCommunityRequest(community.id)
      setCommunity(extractDataObject(response, community))
      setSuccessMessage(response.data.message)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible de quitter ce groupe."))
    } finally {
      setIsJoining(false)
    }
  }

  const handleShare = async () => {
    const url = `${globalThis.location.origin}/communities/${community.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: community.name,
          text: community.description || 'Groupe YaZoo',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setSuccessMessage('Lien du groupe copie.')
      }
    } catch {
      setErrorMessage('Partage annule ou indisponible.')
    }
  }

  const handleCreatePost = async (payload) => {
    const response = await createPostRequest({
      ...payload,
      community_id: community.id,
      visibility: community.isPrivate ? 'followers' : 'public',
    })

    const nextPost = extractDataObject(response, null)

    if (nextPost) {
      setPosts((current) => [nextPost, ...asArray(current)])
    }
  }

  const handleToggleLike = async (postId, reaction = 'like') => {
    setLikePendingIds((current) => [...current, postId])

    try {
      const response = await toggleLikeRequest(postId, reaction)
      setPosts((current) =>
        asArray(current).map((post) =>
          post.id === postId ? extractDataObject(response, post) : post,
        ),
      )
    } finally {
      setLikePendingIds((current) => current.filter((id) => id !== postId))
    }
  }

  const handleCreateComment = async (postId, body, options = {}) => {
    const response = await createCommentRequest(postId, {
      body,
      parent_id: options.parentId ?? null,
      reaction: options.reaction ?? null,
    })
    const comment = extractDataObject(response, null)

    if (!comment) {
      return null
    }

    setPosts((current) =>
      asArray(current).map((post) =>
        post.id === postId ? addCommentToPost(post, comment) : post,
      ),
    )

    return comment
  }

  const handleReactToComment = async (postId, commentId, reaction) => {
    const response = await reactToCommentRequest(commentId, reaction)
    const nextComment = extractDataObject(response, null)

    if (!nextComment) {
      return null
    }

    setPosts((current) =>
      asArray(current).map((post) =>
        post.id === postId ? updateCommentInPost(post, nextComment) : post,
      ),
    )

    return nextComment
  }

  const handleUpdatePost = async (postId, payload) => {
    const response = await updatePostRequest(postId, payload)

    setPosts((current) =>
      asArray(current).map((post) =>
        post.id === postId ? extractDataObject(response, post) : post,
      ),
    )

    return extractDataObject(response, null)
  }

  const handleDeletePost = async (postId) => {
    await deletePostRequest(postId)
    setPosts((current) => asArray(current).filter((post) => post.id !== postId))
  }

  if (isLoading) {
    return <StateBox>Chargement du groupe...</StateBox>
  }

  if (!community) {
    return <StateBox>{errorMessage || 'Groupe introuvable.'}</StateBox>
  }

  const coverStyle = community.imageUrl && !isVideoMedia(community.imageUrl)
    ? {
        backgroundImage: `linear-gradient(rgba(10,8,18,0.12),rgba(10,8,18,0.18)), url(${community.imageUrl})`,
      }
    : undefined
  const safePosts = asArray(posts)
  const mediaPosts = safePosts.filter((post) => post.mediaUrl || post.imageUrl)
  const canViewDiscussion = !community.isPrivate || community.isMember || community.isAdmin
  const memberPreview = getUniqueMembers([community.owner, community.isMember ? user : null])

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/94 shadow-[0_24px_60px_rgba(124,58,237,0.1)] dark:border-violet-300/12 dark:bg-white/8">
        <div
          className="relative h-56 bg-[linear-gradient(135deg,#4c1d95,#7c3aed,#c4b5fd)] bg-cover bg-center sm:h-72 lg:h-96"
          style={coverStyle}
        >
          <div className="absolute inset-0 bg-white/5 dark:bg-black/10" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-stone-950/58 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                {community.isPrivate ? 'Groupe prive' : 'Groupe public'}
              </span>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{community.name}</h1>
              <p className="mt-2 text-sm font-medium text-white/82">
                {community.membersCount} membre{community.membersCount > 1 ? 's' : ''} · cree le {formatDate(community.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!community.isMember && community.membershipStatus !== 'pending' ? (
                <Button type="button" onClick={handleJoin} disabled={isJoining}>
                  {community.isPrivate ? "Demander l'acces" : 'Rejoindre'}
                </Button>
              ) : null}
              {community.isMember ? (
                <Button type="button" variant="secondary" onClick={handleLeave} disabled={isJoining}>
                  Quitter
                </Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={handleShare}>
                Partager
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-violet-100/70 px-5 py-4 dark:border-violet-300/12">
          <div className="flex gap-2 overflow-x-auto">
            {COMMUNITY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-violet-600 text-white'
                    : 'text-stone-600 hover:bg-violet-50 dark:text-violet-100/70 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {errorMessage ? <Alert tone="error">{errorMessage}</Alert> : null}
      {successMessage ? <Alert>{successMessage}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {activeTab === 'discussion' ? (
            <>
              {!canViewDiscussion ? (
                <StateBox>Ce groupe est prive. Rejoignez-le pour consulter la discussion.</StateBox>
              ) : null}

              {canViewDiscussion && community.isMember ? (
                <CreatePost onCreate={handleCreatePost} />
              ) : null}

              {canViewDiscussion && !community.isMember ? (
                <section className="rounded-[28px] border border-dashed border-violet-200 bg-white/78 p-5 text-sm text-stone-600 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-100/70">
                  Rejoignez le groupe pour publier et participer a la discussion.
                </section>
              ) : null}

              {canViewDiscussion && isPostsLoading ? <StateBox>Chargement des publications du groupe...</StateBox> : null}

              {canViewDiscussion && !isPostsLoading && safePosts.length === 0 ? (
                <StateBox>Aucune publication dans ce groupe pour le moment.</StateBox>
              ) : null}

              {canViewDiscussion && !isPostsLoading && safePosts.length > 0 ? (
                <div className="space-y-5">
                  {safePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      onCreateComment={handleCreateComment}
                      onDeletePost={handleDeletePost}
                      onReactToComment={handleReactToComment}
                      onToggleLike={handleToggleLike}
                      onUpdatePost={handleUpdatePost}
                      isLikePending={likePendingIds.includes(post.id)}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {activeTab === 'about' ? (
            <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
              <h2 className="text-xl font-semibold text-stone-950 dark:text-violet-50">A propos du groupe</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-violet-100/72">
                {community.description || 'Ce groupe attend encore sa description.'}
              </p>
              <div className="mt-5 grid gap-3 text-sm text-stone-600 sm:grid-cols-3 dark:text-violet-100/72">
                <InfoPill label="Visibilite" value={community.isPrivate ? 'Prive' : 'Public'} />
                <InfoPill label="Proprietaire" value={community.owner?.name || 'YaZoo'} />
                <InfoPill label="Statut" value={getMembershipLabel(community)} />
              </div>
            </section>
          ) : null}

          {activeTab === 'members' ? (
            <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
              <h2 className="text-xl font-semibold text-stone-950 dark:text-violet-50">Membres du groupe</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {memberPreview.map((member) => (
                  <div key={member.id ?? member.name} className="flex items-center gap-3 rounded-[22px] border border-violet-100 bg-white/80 p-3 dark:border-violet-300/12 dark:bg-white/8">
                    <Avatar name={member.name} src={member.avatar || ''} />
                    <div>
                      <p className="font-semibold text-stone-950 dark:text-violet-50">{member.name}</p>
                      <p className="text-xs text-stone-500 dark:text-violet-100/60">
                        {String(member.id) === String(community.owner?.id) ? 'Admin' : 'Membre'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {memberPreview.length === 0 ? <StateBox>Aucun membre affiche pour le moment.</StateBox> : null}
            </section>
          ) : null}

          {activeTab === 'media' ? (
            <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
              <h2 className="text-xl font-semibold text-stone-950 dark:text-violet-50">Medias du groupe</h2>
              {mediaPosts.length === 0 ? (
                <StateBox>Aucune photo ou video publiee dans ce groupe.</StateBox>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {mediaPosts.map((post) => (
                    <MediaPreview key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-violet-50">A propos</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-violet-100/70">
              {community.description || 'Aucune description pour le moment.'}
            </p>
            <div className="mt-4 space-y-3 text-sm text-stone-600 dark:text-violet-100/70">
              <p><strong className="text-stone-950 dark:text-violet-50">Visibilite :</strong> {community.isPrivate ? 'Prive' : 'Public'}</p>
              <p><strong className="text-stone-950 dark:text-violet-50">Proprietaire :</strong> {community.owner?.name}</p>
              <p><strong className="text-stone-950 dark:text-violet-50">Statut :</strong> {getMembershipLabel(community)}</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-violet-50">Membres recents</h2>
            <div className="mt-4 flex -space-x-3">
              {memberPreview.map((member, index) => (
                <Avatar
                  key={`${member.id ?? index}-${member.name}`}
                  name={member.name}
                  src={member.avatar || ''}
                  className="border-2 border-white dark:border-stone-950"
                />
              ))}
            </div>
          </section>

          <Link
            to="/communities"
            className="block rounded-[24px] border border-violet-100 bg-white/80 px-5 py-4 text-center text-sm font-semibold text-violet-900 transition hover:bg-violet-50 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12"
          >
            Retour aux groupes
          </Link>
        </aside>
      </div>
    </section>
  )
}

function getMembershipLabel(community) {
  if (community.membershipStatus === 'pending') {
    return 'Demande en attente'
  }

  if (community.isMember) {
    return 'Membre'
  }

  return 'Non membre'
}

function Alert({ children, tone = 'success' }) {
  const className =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return <div className={`rounded-[24px] border px-5 py-4 text-sm ${className}`}>{children}</div>
}

function StateBox({ children }) {
  return (
    <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/84 px-5 py-12 text-center text-sm text-stone-500 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-100/70">
      {children}
    </div>
  )
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-[22px] border border-violet-100 bg-white/78 px-4 py-3 dark:border-violet-300/12 dark:bg-white/8">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-violet-100/52">
        {label}
      </p>
      <p className="mt-1 font-semibold text-stone-950 dark:text-violet-50">
        {value}
      </p>
    </div>
  )
}

function MediaPreview({ post }) {
  const mediaUrl = post.mediaUrl ?? post.imageUrl
  const isVideo = post.mediaKind === 'video'

  return (
    <article className="overflow-hidden rounded-[24px] border border-violet-100 bg-white/78 dark:border-violet-300/12 dark:bg-white/8">
      {isVideo ? (
        <video src={mediaUrl} controls className="h-64 w-full object-cover sm:h-80" />
      ) : (
        <img src={mediaUrl} alt={post.content || 'Media du groupe'} className="h-64 w-full object-cover sm:h-80" />
      )}
      <p className="line-clamp-2 px-4 py-3 text-sm text-stone-600 dark:text-violet-100/72">
        {post.content || 'Publication du groupe'}
      </p>
    </article>
  )
}

function getUniqueMembers(members) {
  const seen = new Set()

  return members.filter((member) => {
    if (!member?.id && !member?.name) {
      return false
    }

    const key = String(member.id ?? member.name)

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

Alert.propTypes = {
  children: PropTypes.node,
  tone: PropTypes.string,
}

StateBox.propTypes = {
  children: PropTypes.node,
}

InfoPill.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
}

MediaPreview.propTypes = {
  post: PropTypes.object,
}

function addCommentToPost(post, comment) {
  if (comment.parentId) {
    return {
      ...post,
      commentsCount: (post.commentsCount ?? post.comments?.length ?? 0) + 1,
      comments: (post.comments ?? []).map((existingComment) =>
        existingComment.id === comment.parentId
          ? {
              ...existingComment,
              replies: [...(existingComment.replies ?? []), comment],
            }
          : existingComment,
      ),
    }
  }

  return {
    ...post,
    commentsCount: (post.commentsCount ?? post.comments?.length ?? 0) + 1,
    comments: [comment, ...(post.comments ?? [])],
  }
}

function updateCommentInPost(post, nextComment) {
  return {
    ...post,
    comments: (post.comments ?? []).map((comment) => {
      if (comment.id === nextComment.id) {
        return nextComment
      }

      return {
        ...comment,
        replies: (comment.replies ?? []).map((reply) =>
          reply.id === nextComment.id ? nextComment : reply,
        ),
      }
    }),
  }
}

function isVideoMedia(value = '') {
  return /\.(mp4|webm|mov|quicktime)(\?|#|$)/i.test(String(value).toLowerCase())
}

export default CommunityDetailPage
