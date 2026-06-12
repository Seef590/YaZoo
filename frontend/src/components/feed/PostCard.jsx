import { useState } from 'react'
import PropTypes from 'prop-types'

import { formatDate } from '../../utils/formatDate'
import { getErrorMessage } from '../../utils/getErrorMessage'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import CommentList from './CommentList'

const POST_REACTIONS = [
  { key: 'like', label: "J'aime", icon: '\u{1F44D}' },
  { key: 'love', label: "J'adore", icon: '\u{2764}\u{FE0F}' },
  { key: 'happy', label: 'Content', icon: '\u{1F60A}' },
  { key: 'wow', label: 'Wow', icon: '\u{1F62E}' },
]

const POST_VISIBILITIES = [
  { key: 'public', label: 'Public', helper: 'Tout le monde peut voir ce post.' },
  { key: 'followers', label: 'Followers', helper: 'Visible par vos abonnes.' },
  { key: 'private', label: 'Prive', helper: 'Visible seulement par vous.' },
]

function PostCard({
  post,
  currentUserId,
  onCreateComment,
  onDeletePost,
  onReactToComment,
  onToggleLike,
  onUpdatePost,
  isLikePending = false,
}) {
  const [showComments, setShowComments] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [commentBody, setCommentBody] = useState('')
  const [commentReaction, setCommentReaction] = useState('')
  const [commentError, setCommentError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingPost, setIsUpdatingPost] = useState(false)
  const mediaUrl = post.mediaUrl ?? post.imageUrl ?? null
  const mediaKind = post.mediaKind ?? (post.imageUrl ? 'image' : null)
  const canManagePost = String(post.author?.id) === String(currentUserId)
  const visibility = post.visibility ?? 'public'
  const visibilityLabel = getVisibilityLabel(visibility)

  const metadata = [post.location, formatDate(post.createdAt)]
    .filter(Boolean)
    .join(' - ')

  const handleSubmitComment = async (event) => {
    event.preventDefault()

    if (!commentBody.trim()) {
      return
    }

    setCommentError('')
    setIsSubmittingComment(true)

    try {
      await onCreateComment(post.id, commentBody.trim(), {
        reaction: commentReaction || null,
      })
      setCommentBody('')
      setCommentReaction('')
      setShowComments(true)
    } catch (error) {
      setCommentError(
        getErrorMessage(error, "Impossible d'ajouter le commentaire."),
      )
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSharePost = async () => {
    const url = `${globalThis.location.origin}/feed?post=${post.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post YaZoo de ${post.author?.name ?? 'membre'}`,
          text: post.content || 'Publication YaZoo',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setActionMessage('Lien du post copie.')
      }
    } catch {
      setActionMessage('Partage annule ou indisponible.')
    } finally {
      setIsMenuOpen(false)
    }
  }

  const handleSavePost = async () => {
    try {
      await navigator.clipboard.writeText(`${globalThis.location.origin}/feed?post=${post.id}`)
      setActionMessage('Lien enregistre dans le presse-papiers.')
    } catch {
      setActionMessage("Impossible d'enregistrer ce post pour le moment.")
    } finally {
      setIsMenuOpen(false)
    }
  }

  const handleVisibilityChange = async (nextVisibility) => {
    if (!onUpdatePost || !canManagePost) {
      return
    }

    setIsUpdatingPost(true)
    setActionMessage('')

    try {
      await onUpdatePost(post.id, { visibility: nextVisibility })
      setActionMessage(`Visibilite mise a jour : ${getVisibilityLabel(nextVisibility)}.`)
    } catch (error) {
      setActionMessage(getErrorMessage(error, 'Impossible de changer la visibilite.'))
    } finally {
      setIsUpdatingPost(false)
      setIsMenuOpen(false)
    }
  }

  const handleEditPost = async (event) => {
    event.preventDefault()

    if (!onUpdatePost || !editContent.trim()) {
      return
    }

    setIsUpdatingPost(true)
    setActionMessage('')

    try {
      await onUpdatePost(post.id, { content: editContent.trim() })
      setIsEditing(false)
      setActionMessage('Post mis a jour.')
    } catch (error) {
      setActionMessage(getErrorMessage(error, 'Impossible de modifier ce post.'))
    } finally {
      setIsUpdatingPost(false)
    }
  }

  const handleDeletePost = async () => {
    if (!onDeletePost || !canManagePost) {
      return
    }

    const confirmed = globalThis.confirm('Supprimer ce post ? Cette action est definitive.')

    if (!confirmed) {
      return
    }

    setIsUpdatingPost(true)

    try {
      await onDeletePost(post.id)
    } catch (error) {
      setActionMessage(getErrorMessage(error, 'Impossible de supprimer ce post.'))
      setIsUpdatingPost(false)
    }
  }

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.94))] shadow-[0_24px_56px_rgba(124,58,237,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_28px_60px_rgba(124,58,237,0.12)] dark:border-violet-300/12 dark:bg-[linear-gradient(180deg,_rgba(24,16,38,0.96),_rgba(36,20,61,0.92))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#7c3aed,#a855f7,#d8b4fe,#ede9fe)]" />

      <div className="p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar name={post.author?.name} src={post.author?.avatar} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-stone-900 dark:text-violet-50">
                  {post.author?.name}
                </h3>
                <p className="text-sm text-stone-500 dark:text-violet-100/60">{metadata}</p>
                <span className="mt-2 inline-flex rounded-full border border-violet-100 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-violet-800 dark:border-violet-300/15 dark:bg-white/8 dark:text-violet-100">
                  {visibilityLabel}
                </span>
              </div>

              <PostActionsMenu
                canManagePost={canManagePost}
                isMenuOpen={isMenuOpen}
                isUpdatingPost={isUpdatingPost}
                post={post}
                visibility={visibility}
                onDeletePost={handleDeletePost}
                onEditPost={() => {
                  setEditContent(post.content ?? '')
                  setIsEditing(true)
                  setIsMenuOpen(false)
                }}
                onSavePost={handleSavePost}
                onSharePost={handleSharePost}
                onToggleMenu={() => setIsMenuOpen((current) => !current)}
                onVisibilityChange={handleVisibilityChange}
              />
            </div>

            {(post.tags ?? []).length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-3 py-1 text-xs font-medium text-violet-800 transition hover:border-violet-200 hover:bg-violet-50 dark:border-violet-300/12 dark:bg-white/8 dark:text-violet-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {isEditing ? (
              <form onSubmit={handleEditPost} className="mt-4 space-y-3">
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none transition focus:border-violet-400 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isUpdatingPost || !editContent.trim()}>
                    {isUpdatingPost ? 'Mise a jour...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-4 text-sm leading-7 text-stone-700 dark:text-violet-50/86">
                {post.content}
              </p>
            )}

            {actionMessage ? (
              <p className="mt-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-100">
                {actionMessage}
              </p>
            ) : null}

            {mediaUrl ? (
              <div className="relative mt-4 overflow-hidden rounded-[28px] bg-stone-100 shadow-[0_18px_40px_rgba(124,58,237,0.08)] dark:bg-stone-900">
                <span className="absolute right-3 top-3 z-10 rounded-full bg-violet-950/72 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {mediaKind === 'video' ? 'Video' : 'Photo'}
                </span>

                {mediaKind === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="h-64 w-full object-cover sm:h-96 md:h-[34rem] lg:h-[42rem] xl:h-[48rem]"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Illustration du post"
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-96 md:h-[34rem] lg:h-[42rem] xl:h-[48rem]"
                  />
                )}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {POST_REACTIONS.map((reaction) => (
                  <button
                    key={reaction.key}
                    type="button"
                    onClick={() => onToggleLike(post.id, reaction.key)}
                    disabled={isLikePending}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 ${
                      post.userReaction === reaction.key
                        ? 'border-violet-300 bg-violet-600 text-white shadow-[0_12px_26px_rgba(124,58,237,0.18)]'
                        : 'border-violet-100 bg-white/86 text-violet-900 hover:bg-violet-50 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/14'
                    }`}
                    aria-label={`${reaction.label} ce post`}
                    title={reaction.label}
                  >
                    <span aria-hidden="true">{reaction.icon}</span>
                    <span>
                      {reaction.key === 'like' ? post.likes : getReactionCount(post.reactions, reaction.key)}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowComments((current) => !current)}
              >
                {showComments ? 'Masquer' : 'Commentaires'} |{' '}
                {post.commentsCount ?? post.comments?.length ?? 0}
              </Button>

              <span className="inline-flex items-center rounded-full border border-violet-100 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-600 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-100/80">
                Partages | {post.sharesCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {showComments ? (
          <div className="mt-5 rounded-[26px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] p-4 dark:border-violet-300/12 dark:bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(168,85,247,0.08))]">
            <form onSubmit={handleSubmitComment} className="mb-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {POST_REACTIONS.slice(1).map((reaction) => (
                  <button
                    key={`comment-reaction-${reaction.key}`}
                    type="button"
                    onClick={() =>
                      setCommentReaction((current) =>
                        current === reaction.key ? '' : reaction.key,
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      commentReaction === reaction.key
                        ? 'border-violet-300 bg-violet-600 text-white'
                        : 'border-violet-100 bg-white text-violet-900 hover:bg-violet-50 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50'
                    }`}
                    aria-label={`Ajouter la reaction ${reaction.label}`}
                    title={reaction.label}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </div>
              <textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                rows={3}
                placeholder="Ajouter un commentaire..."
                className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50"
              />

              {commentError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {commentError}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmittingComment}>
                  {isSubmittingComment ? 'Envoi...' : 'Commenter'}
                </Button>
              </div>
            </form>

            <CommentList
              comments={post.comments ?? []}
              postId={post.id}
              reactions={POST_REACTIONS}
              onCreateReply={onCreateComment}
              onReactToComment={onReactToComment}
            />
          </div>
        ) : null}
      </div>
    </article>
  )
}

function PostActionsMenu({
  canManagePost,
  isMenuOpen,
  isUpdatingPost,
  post,
  visibility,
  onDeletePost,
  onEditPost,
  onSavePost,
  onSharePost,
  onToggleMenu,
  onVisibilityChange,
}) {
  return (
    <div className="relative z-30 ml-auto shrink-0 self-start">
      <button
        type="button"
        onClick={onToggleMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-100 bg-white/86 text-lg font-bold text-violet-900 transition hover:bg-violet-50 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/14"
        aria-label="Options du post"
        aria-expanded={isMenuOpen}
      >
        ...
      </button>

      {isMenuOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,34rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-[24px] border border-violet-100 bg-white/98 p-2 text-sm shadow-[0_24px_60px_rgba(76,29,149,0.22)] backdrop-blur-xl dark:border-violet-300/14 dark:bg-stone-950/96">
          <PostMenuButton onClick={onSharePost}>Partager</PostMenuButton>
          <PostMenuButton onClick={onSavePost}>Enregistrer le lien</PostMenuButton>

          {canManagePost ? (
            <>
              <PostMenuButton onClick={onEditPost}>Modifier le post</PostMenuButton>
              <div className="my-2 h-px bg-violet-100 dark:bg-violet-300/12" />
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-violet-100/58">
                Visibilite
              </p>
              {POST_VISIBILITIES.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onVisibilityChange(option.key)}
                  disabled={isUpdatingPost}
                  className={`block w-full rounded-2xl px-3 py-2 text-left transition disabled:opacity-60 ${
                    visibility === option.key
                      ? 'bg-violet-600 text-white'
                      : 'text-stone-700 hover:bg-violet-50 dark:text-violet-50 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-xs opacity-72">{option.helper}</span>
                </button>
              ))}
              <div className="my-2 h-px bg-violet-100 dark:bg-violet-300/12" />
              <PostMenuButton tone="danger" onClick={onDeletePost}>
                Supprimer
              </PostMenuButton>
            </>
          ) : (
            <p className="px-3 py-2 text-xs text-stone-500 dark:text-violet-100/62">
              Options auteur disponibles uniquement pour {post.author?.name}.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function PostMenuButton({ children, onClick, tone = 'default' }) {
  const toneClass =
    tone === 'danger'
      ? 'text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/12'
      : 'text-stone-700 hover:bg-violet-50 dark:text-violet-50 dark:hover:bg-white/10'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-2xl px-3 py-2 text-left font-semibold transition ${toneClass}`}
    >
      {children}
    </button>
  )
}

function getVisibilityLabel(visibility) {
  return POST_VISIBILITIES.find((option) => option.key === visibility)?.label ?? 'Public'
}

function getReactionCount(reactions = [], reactionKey) {
  return reactions.find((reaction) => reaction.reaction === reactionKey)?.count ?? 0
}

PostCard.propTypes = {
  post: PropTypes.object,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCreateComment: PropTypes.func,
  onDeletePost: PropTypes.func,
  onReactToComment: PropTypes.func,
  onToggleLike: PropTypes.func,
  onUpdatePost: PropTypes.func,
  isLikePending: PropTypes.bool,
}

PostActionsMenu.propTypes = {
  canManagePost: PropTypes.bool,
  isMenuOpen: PropTypes.bool,
  isUpdatingPost: PropTypes.bool,
  post: PropTypes.object,
  visibility: PropTypes.string,
  onDeletePost: PropTypes.func,
  onEditPost: PropTypes.func,
  onSavePost: PropTypes.func,
  onSharePost: PropTypes.func,
  onToggleMenu: PropTypes.func,
  onVisibilityChange: PropTypes.func,
}

PostMenuButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  tone: PropTypes.string,
}

export default PostCard
