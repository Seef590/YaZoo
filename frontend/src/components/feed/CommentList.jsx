import { formatDate } from '../../utils/formatDate'
import Avatar from '../ui/Avatar'

function CommentList({ comments }) {
  if (!comments.length) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-white/80 px-4 py-3 text-sm text-stone-500">
        Aucun commentaire pour l'instant.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex items-start gap-3 rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.84))] px-4 py-3 shadow-[0_12px_28px_rgba(124,58,237,0.06)]"
        >
          <Avatar name={comment.author.name} src={comment.author.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-stone-900">
                {comment.author.name}
              </p>
              <span className="text-xs text-stone-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentList
