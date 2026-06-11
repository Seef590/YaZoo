import { useState } from 'react'

import { formatDate } from '../../utils/formatDate'
import { getErrorMessage } from '../../utils/getErrorMessage'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import CommentList from './CommentList'

const POST_REACTIONS = [
  { key: 'like', label: 'J’aime', icon: '👍' },
  { key: 'love', label: 'J’adore', icon: '❤️' },
  { key: 'happy', label: 'Content', icon: '😊' },
  { key: 'wow', label: 'Wow', icon: '😮' },
]

function PostCard({
  post,
  onCreateComment,
  onReactToComment,
  onToggleLike,
  isLikePending = false,
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commentReaction, setCommentReaction] = useState('')
  const [commentError, setCommentError] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const mediaUrl = post.mediaUrl ?? post.imageUrl ?? null
  const mediaKind = post.mediaKind ?? (post.imageUrl ? 'image' : null)

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

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99),_rgba(246,239,255,0.94))] shadow-[0_24px_56px_rgba(124,58,237,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_28px_60px_rgba(124,58,237,0.12)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#7c3aed,#a855f7,#d8b4fe,#ede9fe)]" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={post.author.name} src={post.author.avatar} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  {post.author.name}
                </h3>
                <p className="text-sm text-stone-500">{metadata}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] px-3 py-1 text-xs font-medium text-violet-800 transition hover:border-violet-200 hover:bg-violet-50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-stone-700">
              {post.content}
            </p>

            {mediaUrl ? (
              <div className="relative mt-4 overflow-hidden rounded-[28px] bg-stone-100 shadow-[0_18px_40px_rgba(124,58,237,0.08)]">
                <span className="absolute right-3 top-3 z-10 rounded-full bg-violet-950/72 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {mediaKind === 'video' ? 'Video' : 'Photo'}
                </span>

                {mediaKind === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="h-64 w-full object-cover sm:h-80 md:h-96 lg:h-[28rem]"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Illustration du post"
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-80 md:h-96 lg:h-[28rem]"
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
                        : 'border-violet-100 bg-white/86 text-violet-900 hover:bg-violet-50'
                    }`}
                    aria-label={`${reaction.label} ce post`}
                    title={reaction.label}
                  >
                    <span aria-hidden="true">{reaction.icon}</span>
                    <span>{reaction.key === 'like' ? post.likes : getReactionCount(post.reactions, reaction.key)}</span>
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

              <span className="inline-flex items-center rounded-full border border-violet-100 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-600">
                Partages | {post.sharesCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {showComments ? (
          <div className="mt-5 rounded-[26px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82))] p-4">
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
                        : 'border-violet-100 bg-white text-violet-900 hover:bg-violet-50'
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
                className="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
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

function getReactionCount(reactions = [], reactionKey) {
  return reactions.find((reaction) => reaction.reaction === reactionKey)?.count ?? 0
}

export default PostCard
