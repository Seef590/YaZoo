import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

import { formatDate } from '../../utils/formatDate'
import Avatar from '../ui/Avatar'

const IMAGE_DURATION_MS = 4500
const VIDEO_DURATION_MS = 6500
const MIN_VIDEO_DURATION_MS = 3500
const MAX_VIDEO_DURATION_MS = 15000

function StoryViewer({
  stories,
  activeStoryIndex,
  onChangeStory,
  onClose,
  onStorySeen = null,
  onDeleteStory = null,
  isDeletingStoryId = '',
}) {
  const story = getActiveStory(stories, activeStoryIndex)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [videoTiming, setVideoTiming] = useState({
    storyId: '',
    durationMs: 0,
  })
  const [isPaused, setIsPaused] = useState(false)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const touchStartYRef = useRef(null)

  const currentSlide = story?.slides?.[activeSlideIndex] ?? null
  const slideDuration = getSlideDuration(currentSlide, videoTiming)
  const storiesCount = getStoriesCount(stories)
  const storyLabel = getStoryLabel(story, activeStoryIndex, storiesCount)

  const handleNext = useCallback(() => {
    if (!story) {
      return
    }

    if (activeSlideIndex < story.slides.length - 1) {
      setActiveSlideIndex((current) => current + 1)
      return
    }

    if (activeStoryIndex < storiesCount - 1) {
      onChangeStory(activeStoryIndex + 1)
      return
    }

    onClose()
  }, [activeSlideIndex, activeStoryIndex, onChangeStory, onClose, setActiveSlideIndex, storiesCount, story])

  const handlePrevious = useCallback(() => {
    if (!story) {
      return
    }

    if (activeSlideIndex > 0) {
      setActiveSlideIndex((current) => current - 1)
      return
    }

    if (activeStoryIndex > 0) {
      onChangeStory(activeStoryIndex - 1)
      return
    }

    onClose()
  }, [activeSlideIndex, activeStoryIndex, onChangeStory, onClose, setActiveSlideIndex, story])

  useEffect(() => {
    if (!story || !currentSlide || isPaused) {
      return undefined
    }

    const timeoutId = globalThis.setTimeout(() => {
      handleNext()
    }, slideDuration)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [currentSlide, handleNext, isPaused, slideDuration, story])

  useEffect(() => {
    if (!currentSlide || !onStorySeen) {
      return
    }

    onStorySeen(currentSlide)
  }, [currentSlide, onStorySeen])

  useEffect(() => {
    if (!story) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      handleViewerShortcut(event, handleNext, handlePrevious, onClose)
    }

    globalThis.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeStoryIndex, handleNext, handlePrevious, onClose, story])

  if (!story || !currentSlide) {
    return null
  }

  const slideAuthorName = getSlideAuthorName(currentSlide, story)
  const slideSubtitle = getSlideSubtitle(currentSlide, story)
  const viewsLabel = getViewsLabel(currentSlide.viewsCount)
  const canDeleteSlide = Boolean(currentSlide.isOwn && onDeleteStory)
  const isDeletingCurrentSlide = isDeletingSlide(isDeletingStoryId, currentSlide)
  const deleteButtonLabel = getDeleteButtonLabel(isDeletingCurrentSlide)

  const handlePressStart = () => {
    setIsPaused(true)
  }

  const handlePressEnd = () => {
    setIsPaused(false)
  }

  const handleTouchStart = (event) => {
    touchStartYRef.current = getTouchClientY(event)
    setIsPaused(true)
  }

  const handleTouchMove = (event) => {
    const startY = touchStartYRef.current
    const currentY = getTouchClientY(event)

    if (startY === null || currentY === null) {
      return
    }

    setDragOffsetY(getDragOffsetY(startY, currentY))
  }

  const handleTouchEnd = () => {
    const shouldClose = shouldCloseFromDrag(dragOffsetY)

    touchStartYRef.current = null
    setDragOffsetY(0)
    setIsPaused(false)

    if (shouldClose) {
      onClose()
    }
  }

  const handleTouchCancel = () => {
    touchStartYRef.current = null
    setDragOffsetY(0)
    setIsPaused(false)
  }

  const handleViewerPanelKeyDown = (event) => {
    if (isPauseKey(event.key)) {
      event.preventDefault()
      setIsPaused(true)
    }
  }

  const handleViewerPanelKeyUp = (event) => {
    if (isPauseKey(event.key)) {
      setIsPaused(false)
    }
  }

  const progressBars = story.slides.map((slide, index) =>
    renderProgressBar(slide, index, activeSlideIndex, slideDuration, isPaused),
  )

  // Native <dialog> is intentionally avoided: this overlay depends on portal rendering,
  // body scroll lock, animated layout, and mobile drag gestures.
  const viewer = (
    <div
      className="fixed inset-0 z-[140] bg-stone-950/88 px-3 py-0 backdrop-blur-sm sm:px-6 sm:py-1"
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de stories"
    >
      <div className="mx-auto flex h-full w-full max-w-5xl items-start justify-center pt-[max(0px,env(safe-area-inset-top))] sm:pt-1">
        <div
          className="relative flex h-full w-full max-h-[900px] max-w-[430px] flex-col overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,_rgba(21,18,33,0.98),_rgba(41,26,71,0.96))] shadow-[0_30px_80px_rgba(15,23,42,0.48)]"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          role="button"
          tabIndex={0}
          aria-label="Maintenir pour mettre la story en pause"
          onKeyDown={handleViewerPanelKeyDown}
          onKeyUp={handleViewerPanelKeyUp}
          style={{
            transform: dragOffsetY ? `translateY(${dragOffsetY}px)` : undefined,
            opacity: dragOffsetY ? Math.max(0.76, 1 - dragOffsetY / 320) : 1,
            transition: dragOffsetY > 0 ? 'none' : 'transform 180ms ease, opacity 180ms ease',
          }}
        >
          <div className="absolute inset-x-0 top-0 z-20 space-y-4 px-4 pb-4 pt-4">
            <div className="flex gap-1.5">{progressBars}</div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  name={slideAuthorName}
                  src={currentSlide.authorAvatar ?? ''}
                  size="sm"
                  className="border-white/20"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {slideAuthorName}
                  </p>
                  <p className="truncate text-xs text-white/70">
                    {slideSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/72">
                  {storyLabel}
                </span>
                {currentSlide.isOwn ? (
                  <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/72">
                    {viewsLabel}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
                  aria-label="Fermer les stories"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrevious}
            className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize"
            aria-label="Story precedente"
          />

          <button
            type="button"
            onClick={handleNext}
            className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-e-resize"
            aria-label="Story suivante"
          />

          <div className="relative flex-1">
            {renderSlideMedia(currentSlide, setVideoTiming)}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.62)_0%,_rgba(15,23,42,0.18)_28%,_rgba(15,23,42,0.08)_44%,_rgba(15,23,42,0.82)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 z-20 p-5">
              <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.26)] backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                      {story.title}
                    </span>
                    {currentSlide.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white/82"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {canDeleteSlide ? (
                    <button
                      type="button"
                      onClick={() => onDeleteStory(currentSlide)}
                      disabled={isDeletingCurrentSlide}
                      className="rounded-full bg-rose-500/18 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-500/28 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteButtonLabel}
                    </button>
                  ) : null}
                </div>

                <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                  {currentSlide.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/82">
                  {currentSlide.body}
                </p>

                {currentSlide.isOwn ? (
                  <div className="mt-4 rounded-[22px] bg-white/8 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/65">
                      Vues
                    </p>
                    {currentSlide.viewers?.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentSlide.viewers.slice(0, 6).map((viewer) => (
                          <div
                            key={`${currentSlide.id}-${viewer.id}`}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white/85"
                          >
                            <Avatar
                              name={viewer.name ?? 'Viewer'}
                              src={viewer.avatar ?? ''}
                              size="sm"
                              className="h-7 w-7 rounded-full text-[10px]"
                            />
                            <span>{viewer.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-white/72">
                        Personne n a encore vu cette story.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 left-4 z-20 hidden items-center sm:flex">
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
              aria-label="Aller a la story precedente"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="m15 6-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 z-20 hidden items-center sm:flex">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
              aria-label="Aller a la story suivante"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="m9 6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') {
    return viewer
  }

  return createPortal(viewer, document.body)
}

function getActiveStory(stories, activeStoryIndex) {
  if (activeStoryIndex === null) {
    return null
  }

  return stories[activeStoryIndex] ?? null
}

function getStoryLabel(story, activeStoryIndex, storiesCount) {
  if (!story) {
    return ''
  }

  return `${activeStoryIndex + 1} / ${storiesCount}`
}

function getStoriesCount(stories) {
  return stories.length
}

function handleViewerShortcut(event, handleNext, handlePrevious, onClose) {
  if (event.key === 'Escape') {
    onClose()
  }

  if (event.key === 'ArrowRight') {
    handleNext()
  }

  if (event.key === 'ArrowLeft') {
    handlePrevious()
  }
}

function getSlideDuration(currentSlide, videoTiming) {
  if (currentSlide?.mediaKind !== 'video') {
    return IMAGE_DURATION_MS
  }

  if (currentSlide?.id !== videoTiming.storyId) {
    return VIDEO_DURATION_MS
  }

  return videoTiming.durationMs || VIDEO_DURATION_MS
}

function getTouchClientY(event) {
  const currentY = event.touches?.[0]?.clientY

  if (typeof currentY !== 'number') {
    return null
  }

  return currentY
}

function getDragOffsetY(startY, currentY) {
  const delta = Math.max(0, currentY - startY)

  return Math.min(170, delta)
}

function shouldCloseFromDrag(dragOffsetY) {
  return dragOffsetY > 120
}

function isPauseKey(key) {
  return key === ' ' || key === 'Enter'
}

function getSlideAuthorName(currentSlide, story) {
  return currentSlide.authorName ?? story.title
}

function getSlideSubtitle(currentSlide, story) {
  const subtitle = [
    currentSlide.location,
    currentSlide.createdAt ? formatDate(currentSlide.createdAt) : null,
  ]
    .filter(Boolean)
    .join(' - ')

  return subtitle || story.caption
}

function getViewsLabel(viewsCount = 0) {
  const normalizedViewsCount = viewsCount ?? 0

  if (normalizedViewsCount > 1) {
    return `${normalizedViewsCount} vues`
  }

  return `${normalizedViewsCount} vue`
}

function isDeletingSlide(isDeletingStoryId, currentSlide) {
  return String(isDeletingStoryId) === String(currentSlide.id)
}

function getDeleteButtonLabel(isDeletingCurrentSlide) {
  if (isDeletingCurrentSlide) {
    return 'Suppression...'
  }

  return 'Supprimer'
}

function getProgressWidth(index, activeSlideIndex) {
  if (index < activeSlideIndex) {
    return '100%'
  }

  return '0%'
}

function getProgressAnimation(index, activeSlideIndex, slideDuration) {
  if (index === activeSlideIndex) {
    return `story-progress ${slideDuration}ms linear forwards`
  }

  return 'none'
}

function renderProgressBar(slide, index, activeSlideIndex, slideDuration, isPaused) {
  return (
    <div
      key={slide.id}
      className="h-1 flex-1 overflow-hidden rounded-full bg-white/18"
    >
      <div
        className="h-full rounded-full bg-white/92"
        style={{
          width: getProgressWidth(index, activeSlideIndex),
          animation: getProgressAnimation(index, activeSlideIndex, slideDuration),
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />
    </div>
  )
}

function getNormalizedVideoDuration(durationInSeconds) {
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
    return VIDEO_DURATION_MS
  }

  const normalizedDuration = Math.round(durationInSeconds * 1000)

  return Math.min(
    MAX_VIDEO_DURATION_MS,
    Math.max(MIN_VIDEO_DURATION_MS, normalizedDuration),
  )
}

function handleVideoMetadataLoaded(event, currentSlide, setVideoTiming) {
  setVideoTiming({
    storyId: String(currentSlide.id),
    durationMs: getNormalizedVideoDuration(event.currentTarget.duration),
  })
}

function renderSlideMedia(currentSlide, setVideoTiming) {
  if (!currentSlide.mediaUrl) {
    return (
      <div
        className={`h-full w-full ${currentSlide.surfaceClass ?? 'bg-[linear-gradient(180deg,#7c3aed,#a855f7,#ddd6fe)]'}`}
      />
    )
  }

  if (currentSlide.mediaKind === 'video') {
    return (
      <video
        key={currentSlide.id}
        src={currentSlide.mediaUrl}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => handleVideoMetadataLoaded(event, currentSlide, setVideoTiming)}
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <img
      src={currentSlide.mediaUrl}
      alt={currentSlide.title}
      className="h-full w-full object-cover"
    />
  )
}

const storyIdPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])
const viewerPropType = PropTypes.shape({
  id: storyIdPropType,
  name: PropTypes.string,
  avatar: PropTypes.string,
})
const slidePropType = PropTypes.shape({
  id: storyIdPropType,
  title: PropTypes.string,
  body: PropTypes.string,
  authorName: PropTypes.string,
  authorAvatar: PropTypes.string,
  location: PropTypes.string,
  createdAt: PropTypes.string,
  mediaUrl: PropTypes.string,
  mediaKind: PropTypes.string,
  surfaceClass: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  isOwn: PropTypes.bool,
  isViewed: PropTypes.bool,
  viewsCount: PropTypes.number,
  viewers: PropTypes.arrayOf(viewerPropType),
})
const storyPropType = PropTypes.shape({
  id: storyIdPropType,
  title: PropTypes.string,
  caption: PropTypes.string,
  slides: PropTypes.arrayOf(slidePropType).isRequired,
})

StoryViewer.propTypes = {
  stories: PropTypes.arrayOf(storyPropType).isRequired,
  activeStoryIndex: PropTypes.number,
  onChangeStory: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onStorySeen: PropTypes.func,
  onDeleteStory: PropTypes.func,
  isDeletingStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default StoryViewer
