import { useState } from 'react'
import PropTypes from 'prop-types'

import { followUserRequest, unfollowUserRequest } from '../../api/profile'
import { useI18n } from '../../hooks/useI18n'
import { getErrorMessage } from '../../utils/getErrorMessage'

function FollowButton({
  userId,
  isFollowing = false,
  hidden = false,
  compact = false,
  onChange,
}) {
  const { t } = useI18n()
  const [following, setFollowing] = useState(Boolean(isFollowing))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (hidden || !userId) {
    return null
  }

  const handleToggle = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = following
        ? await unfollowUserRequest(userId)
        : await followUserRequest(userId)
      const nextFollowing = !following

      setFollowing(nextFollowing)
      onChange?.(response.data?.data ?? null, nextFollowing)
    } catch (requestError) {
      setError(getErrorMessage(requestError, t('follow.error')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center justify-center rounded-full font-semibold transition hover:brightness-105 disabled:cursor-wait disabled:opacity-65 ${
          following
            ? 'border border-violet-200 bg-white px-3 py-1.5 text-violet-800 hover:bg-violet-50 dark:border-violet-300/20 dark:bg-white/10 dark:text-violet-50'
            : 'bg-[linear-gradient(135deg,#2563eb,#7c3aed)] px-3 py-1.5 text-white shadow-[0_10px_22px_rgba(37,99,235,0.18)]'
        } ${compact ? 'text-xs' : 'text-sm'}`}
        aria-pressed={following}
      >
        {isLoading
          ? t('follow.loading')
          : following
            ? t('follow.following')
            : t('follow.follow')}
      </button>
      {error ? (
        <span className="max-w-[12rem] text-xs text-rose-600 dark:text-rose-200">
          {error}
        </span>
      ) : null}
    </span>
  )
}

FollowButton.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isFollowing: PropTypes.bool,
  hidden: PropTypes.bool,
  compact: PropTypes.bool,
  onChange: PropTypes.func,
}

export default FollowButton
