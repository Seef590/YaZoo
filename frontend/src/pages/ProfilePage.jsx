import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  createCommentRequest,
  deletePostRequest,
  getPostsRequest,
  reactToCommentRequest,
  toggleLikeRequest,
  updatePostRequest,
} from '../api/posts'
import { getProfileRequest, updateProfileRequest } from '../api/profile'
import { createDirectConversationRequest } from '../api/messages'
import PostCard from '../components/feed/PostCard'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import FollowButton from '../components/ui/FollowButton'
import ScrollTopButton from '../components/ui/ScrollTopButton'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { asArray, extractDataArray, extractDataObject } from '../utils/apiData'
import { getErrorMessage } from '../utils/getErrorMessage'
import { normalizeAuthUserMedia, normalizeProfileMediaPayload } from '../utils/media'

const PROFILE_TABS = [
  { key: 'posts', label: 'Publications' },
  { key: 'about', label: 'A propos' },
  { key: 'media', label: 'Medias' },
  { key: 'communities', label: 'Communautes' },
]

function ProfilePage() {
  const { setUser, user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const { userId: routeUserId } = useParams()
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    country: '',
    city: '',
    bio: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverPhotoFile, setCoverPhotoFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [removeCoverPhoto, setRemoveCoverPhoto] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [recentPublications, setRecentPublications] = useState([])
  const [likePendingIds, setLikePendingIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMessageStarting, setIsMessageStarting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const editSectionRef = useRef(null)
  const nameInputRef = useRef(null)
  const requestedProfileId =
    routeUserId ?? searchParams.get('userId') ?? searchParams.get('id') ?? user?.id
  const isOwnProfile =
    Boolean(user?.id) && String(requestedProfileId ?? user.id) === String(user.id)

  useEffect(() => {
    let cancelled = false

    const fetchProfile = async () => {
      if (!user?.id || !requestedProfileId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getProfileRequest(requestedProfileId)
        const data = normalizeProfileMediaPayload(extractDataObject(response, null))
        const postsResponse = await getPostsRequest()
        const userPosts = extractDataArray(postsResponse).filter(
          (post) => String(post.author?.id) === String(requestedProfileId),
        )

        if (!cancelled) {
          setProfile(data)
          setRecentPublications(userPosts)
          setForm({
            name: data.name ?? '',
            phone: data.phone ?? '',
            country: data.country ?? '',
            city: data.city ?? '',
            bio: data.bio ?? '',
          })
          setAvatarPreview(data.avatar ?? '')
          setCoverPreview(data.coverPhoto ?? '')
          setRemoveAvatar(false)
          setRemoveCoverPhoto(false)
          setErrorMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setRecentPublications([])
          setErrorMessage(
            getErrorMessage(error, 'Impossible de charger le profil.'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [requestedProfileId, user?.id])

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }

      if (coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview)
      }
    }
  }, [avatarPreview, coverPreview])

  useEffect(() => {
    if (!isEditOpen) {
      return undefined
    }

    const timeoutId = globalThis.setTimeout(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      nameInputRef.current?.focus()
    }, 160)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [isEditOpen])

  const handleChange = (field) => (event) => {
    const value = event.target.value

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleFilePreview = (type) => (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const nextPreview = URL.createObjectURL(file)

    if (type === 'avatar') {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }

      setAvatarFile(file)
      setAvatarPreview(nextPreview)
      setRemoveAvatar(false)
      return
    }

    if (coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview)
    }

    setCoverPhotoFile(file)
    setCoverPreview(nextPreview)
    setRemoveCoverPhoto(false)
  }

  const handleRemoveAvatar = () => {
    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(null)
    setAvatarPreview('')
    setRemoveAvatar(true)
  }

  const handleRemoveCoverPhoto = () => {
    if (coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview)
    }

    setCoverPhotoFile(null)
    setCoverPreview('')
    setRemoveCoverPhoto(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isOwnProfile) {
      return
    }

    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await updateProfileRequest(user.id, {
        ...form,
        avatar_file: avatarFile,
        cover_photo_file: coverPhotoFile,
        remove_avatar: removeAvatar,
        remove_cover_photo: removeCoverPhoto,
      })
      const mediaVersion = Date.now()
      const data = normalizeProfileMediaPayload({
        ...extractDataObject(response),
        mediaVersion,
      })

      setProfile(data)
      setAvatarFile(null)
      setCoverPhotoFile(null)
      setAvatarPreview(data.avatar ?? '')
      setCoverPreview(data.coverPhoto ?? '')
      setRemoveAvatar(false)
      setRemoveCoverPhoto(false)
      setUser((current) =>
        normalizeAuthUserMedia({
          ...(current ?? {}),
          name: data.name,
          phone: data.phone,
          country: data.country,
          city: data.city,
          bio: data.bio,
          avatar: data.avatar,
          cover_photo: data.coverPhoto,
          mediaVersion,
          updated_at: data.updatedAt ?? new Date().toISOString(),
        }),
      )
      setSuccessMessage('Profil mis a jour avec succes.')
      setIsEditOpen(false)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de mettre a jour le profil.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const avatarSrc = removeAvatar
    ? ''
    : avatarPreview || profile?.avatar || user?.avatar || ''
  const coverImage = removeCoverPhoto
    ? ''
    : coverPreview || profile?.coverPhoto || user?.cover_photo || ''
  const followersCount = profile?.followersCount ?? 0
  const followingCount = profile?.followingCount ?? 0
  const profileLocation = profile?.city || user?.city || ''
  const searchTerm = searchParams.get('q')?.trim() ?? ''
  const visibleRecentPublications = filterPublications(
    recentPublications,
    searchTerm,
  )
  const mediaPublications = visibleRecentPublications.filter(
    (post) => post.mediaUrl || post.imageUrl,
  )

  const handleEditToggle = () => {
    if (!isOwnProfile) {
      return
    }

    if (isEditOpen) {
      setIsEditOpen(false)
      return
    }

    setIsEditOpen(true)
  }

  const handleShareProfile = async () => {
    const profileUrl = `${globalThis.location.origin}/profile/${profile?.id ?? requestedProfileId ?? user?.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Profil YaZoo',
          text: `Decouvrez le profil de ${profile?.name ?? user?.name ?? 'Utilisateur'} sur YaZoo.`,
          url: profileUrl,
        })
        return
      } catch {
        // User cancelled share dialog.
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl)
      setSuccessMessage('Lien du profil copie dans le presse-papiers.')
      setErrorMessage('')
    } catch {
      setErrorMessage('Impossible de partager le profil pour le moment.')
    }
  }

  const handleStartConversation = async () => {
    if (!profile?.id || isOwnProfile) {
      return
    }

    setIsMessageStarting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await createDirectConversationRequest({
        user_id: profile.id,
      })
      const conversation = extractDataObject(response, null)

      if (!conversation?.id) {
        throw new Error('Conversation introuvable.')
      }

      navigate(`/messages?conversation=${conversation.id}`)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Impossible de demarrer la conversation.'),
      )
    } finally {
      setIsMessageStarting(false)
    }
  }

  const handleToggleLike = async (postId, reaction = 'like') => {
    let previousPost = null

    setLikePendingIds((current) => [...current, postId])
    setRecentPublications((current) =>
      asArray(current).map((post) => {
        if (post.id !== postId) {
          return post
        }

        previousPost = post

        return {
          ...post,
          liked: post.userReaction === reaction ? false : true,
          userReaction: post.userReaction === reaction ? null : reaction,
          likes:
            post.userReaction === reaction
              ? Math.max(0, post.likes - 1)
              : post.liked
                ? post.likes
                : post.likes + 1,
        }
      }),
    )

    try {
      const response = await toggleLikeRequest(postId, reaction)

      setRecentPublications((current) =>
        asArray(current).map((post) =>
          post.id === postId ? extractDataObject(response, post) : post,
        ),
      )
    } catch (error) {
      if (previousPost) {
        setRecentPublications((current) =>
          asArray(current).map((post) => (post.id === postId ? previousPost : post)),
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

    setRecentPublications((current) =>
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

    setRecentPublications((current) =>
      asArray(current).map((post) =>
        post.id === postId ? updateCommentInPost(post, nextComment) : post,
      ),
    )

    return nextComment
  }

  const handleUpdatePost = async (postId, payload) => {
    const response = await updatePostRequest(postId, payload)

    setRecentPublications((current) =>
      asArray(current).map((post) =>
        post.id === postId ? extractDataObject(response, post) : post,
      ),
    )

    return extractDataObject(response, null)
  }

  const handleDeletePost = async (postId) => {
    await deletePostRequest(postId)
    setRecentPublications((current) => asArray(current).filter((post) => post.id !== postId))
    setProfile((current) =>
      current
        ? {
            ...current,
            postsCount: Math.max(0, (current.postsCount ?? 1) - 1),
          }
        : current,
    )
  }

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/92 shadow-[0_24px_60px_rgba(124,58,237,0.08)] sm:rounded-[32px] dark:border-violet-300/12 dark:bg-white/8">
        <div
          className="relative h-56 bg-[linear-gradient(135deg,#5b21b6_0%,#8b5cf6_45%,#ddd6fe_100%)] sm:h-64 md:h-80 lg:h-96 xl:h-[28rem]"
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt="Photo de couverture du profil"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(17,12,28,0.22))]" />
          <div className="absolute bottom-5 right-5 z-10 rounded-full bg-white/18 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
            Profil YaZoo
          </div>
          <div className="absolute -bottom-12 left-1/2 z-20 -translate-x-1/2">
            <Avatar
              name={profile?.name ?? user?.name ?? 'YaZoo User'}
              src={avatarSrc}
              size="xl"
              className="border-4 border-white shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
            />
          </div>
        </div>

        <div className="px-4 pb-5 pt-16 sm:px-5 sm:pb-6 sm:pt-16">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
                  {t('profile.publicProfile')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl dark:text-violet-50">
                  {profile?.name ?? user?.name}
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-violet-100/62">
                  @{(profile?.name ?? user?.name ?? 'username').toLowerCase().replace(/\s+/g, '')}
                  {profileLocation || profile?.country ? ' - ' : ''}
                  {[profileLocation, profile?.country].filter(Boolean).join(', ')}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-violet-100/76">
                  {profile?.bio ||
                    'Bienvenue sur mon profil YaZoo. Retrouvez ici mes publications, mes annonces et mes moments autour des animaux.'}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              {isOwnProfile ? (
                <Button
                  type="button"
                  variant={isEditOpen ? 'ghost' : 'secondary'}
                  onClick={handleEditToggle}
                  className="w-full sm:w-auto"
                >
                  {isEditOpen ? 'Fermer' : 'Modifier'}
                </Button>
            ) : (
              <>
                <FollowButton
                  userId={profile?.id}
                  isFollowing={profile?.isFollowing}
                  hidden={isOwnProfile}
                  onChange={(nextProfile) => {
                    if (nextProfile) {
                      setProfile(normalizeProfileMediaPayload(nextProfile))
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleStartConversation}
                  disabled={isMessageStarting}
                  className="w-full sm:w-auto"
                >
                  {isMessageStarting ? t('common.loading') : t('messages.sendMessage')}
                </Button>
              </>
              )}
              <button
                type="button"
                onClick={handleShareProfile}
                className="inline-flex w-full items-center justify-center rounded-full border border-violet-200/80 bg-white/92 px-4 py-2 text-sm font-medium text-stone-700 shadow-[0_12px_26px_rgba(124,58,237,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/80 hover:text-violet-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 sm:w-auto dark:border-violet-300/16 dark:bg-white/8 dark:text-violet-50 dark:hover:bg-white/12"
              >
                {t('profile.shareProfile')}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatCard label="Posts" value={profile?.postsCount ?? 0} />
            <StatCard label="Abonnes" value={followersCount} />
            <StatCard label="Abonnements" value={followingCount} />
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

      <section className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_48px_rgba(124,58,237,0.08)] dark:border-violet-300/12 dark:bg-white/8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PROFILE_TABS.map((tab) => (
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

        {activeTab === 'posts' ? (
          <div className="mt-5 space-y-4">
            {recentPublications.length === 0 ? (
              <EmptyProfileState>Aucune publication pour le moment.</EmptyProfileState>
            ) : null}

            {recentPublications.length > 0 && visibleRecentPublications.length === 0 ? (
              <EmptyProfileState>Aucune publication ne correspond a votre recherche.</EmptyProfileState>
            ) : null}

            {visibleRecentPublications.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onCreateComment={handleCreateComment}
                onReactToComment={handleReactToComment}
                onToggleLike={handleToggleLike}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                isLikePending={likePendingIds.includes(post.id)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'about' ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ProfileInfo label="Nom" value={profile?.name ?? user?.name ?? 'Utilisateur'} />
            <ProfileInfo label="Ville" value={profileLocation || 'Non renseignee'} />
            <ProfileInfo label="Pays" value={profile?.country || user?.country || 'Non renseigne'} />
            <ProfileInfo label="Membre depuis" value={formatProfileDate(profile?.createdAt)} />
            <div className="rounded-[24px] border border-violet-100 bg-white/78 p-4 lg:col-span-2 dark:border-violet-300/12 dark:bg-white/8">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-violet-100/52">Bio</p>
              <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-violet-100/76">
                {profile?.bio || 'Ce membre partage son univers animalier sur YaZoo.'}
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === 'media' ? (
          <div className="mt-5">
            {mediaPublications.length === 0 ? (
              <EmptyProfileState>Aucune photo ou video publiee pour le moment.</EmptyProfileState>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {mediaPublications.map((post) => (
                  <ProfileMediaPreview key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === 'communities' ? (
          <div className="mt-5">
            <EmptyProfileState>
              Les communautes liees a ce profil seront affichees ici lorsqu elles seront disponibles.
            </EmptyProfileState>
          </div>
        ) : null}
      </section>

      {isOwnProfile && isEditOpen ? (
        <form
          ref={editSectionRef}
          onSubmit={handleSubmit}
          className="scroll-mt-24 rounded-[30px] border border-white/80 bg-white/94 p-5 shadow-[0_24px_56px_rgba(124,58,237,0.08)]"
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-stone-950">
              Modifier mon profil
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Mettez a jour votre presentation publique et vos informations de
              contact.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-stone-500">Chargement du profil...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.78))] p-4">
                  <p className="text-sm font-medium text-stone-800">
                    Photo de profil
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Avatar
                      name={form.name || profile?.name || user?.name || 'YaZoo User'}
                      src={removeAvatar ? '' : avatarPreview || profile?.avatar || user?.avatar || ''}
                      size="lg"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-violet-50">
                      Changer la photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFilePreview('avatar')}
                        className="hidden"
                      />
                    </label>
                    {avatarPreview ? (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        Retirer
                      </button>
                    ) : null}
                  </div>
                  {avatarFile ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {avatarFile.name}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,237,255,0.82),_rgba(237,233,254,0.74))] p-4">
                  <p className="text-sm font-medium text-stone-800">
                    Photo de couverture
                  </p>
                  <div className="relative mt-4 h-40 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#5b21b6_0%,#8b5cf6_45%,#ddd6fe_100%)]">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Apercu de la photo de couverture"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(17,12,28,0.16))]" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-violet-50">
                      Changer la couverture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFilePreview('cover')}
                        className="hidden"
                      />
                    </label>
                    {coverPreview ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoverPhoto}
                        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        Retirer
                      </button>
                    ) : null}
                  </div>
                  {coverPhotoFile ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {coverPhotoFile.name}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Nom"
                  value={form.name}
                  onChange={handleChange('name')}
                  inputRef={nameInputRef}
                />
                <Field label="Email" value={profile?.email ?? user?.email ?? ''} readOnly />
                <Field label="Telephone" value={form.phone} onChange={handleChange('phone')} />
                <Field label="Pays" value={form.country} onChange={handleChange('country')} />
                <Field label="Ville" value={form.city} onChange={handleChange('city')} />
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Bio
                </span>
                <textarea
                  rows={5}
                  value={form.bio}
                  onChange={handleChange('bio')}
                  className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-violet-400 focus:bg-white"
                  placeholder="Parlez de vous, de vos animaux et de ce que vous partagez sur YaZoo."
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditOpen(false)
                    setAvatarFile(null)
                    setCoverPhotoFile(null)
                    setRemoveAvatar(false)
                    setRemoveCoverPhoto(false)
                    setAvatarPreview(profile?.avatar ?? '')
                    setCoverPreview(profile?.coverPhoto ?? '')
                  }}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les changements'}
                </Button>
              </div>
            </div>
          )}
        </form>
      ) : null}

      <ScrollTopButton />
    </section>
  )
}

function Field({ label, inputRef = null, readOnly = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-violet-100">
        {label}
      </span>
      <input
        ref={inputRef}
        readOnly={readOnly}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
          readOnly
            ? 'border-stone-200 bg-stone-100 text-stone-500 dark:border-violet-300/12 dark:bg-white/8 dark:text-violet-100/62'
            : 'border-violet-100 bg-violet-50/50 text-stone-700 focus:border-violet-400 focus:bg-white dark:border-violet-300/18 dark:bg-[#12051f] dark:text-violet-50 dark:placeholder:text-violet-200/45 dark:focus:bg-[#160827]'
        }`}
        {...props}
      />
    </label>
  )
}

function EmptyProfileState({ children }) {
  return (
    <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/84 px-5 py-10 text-center text-sm text-stone-500 dark:border-violet-300/14 dark:bg-white/8 dark:text-violet-100/70">
      {children}
    </div>
  )
}

function ProfileInfo({ label, value }) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-white/78 p-4 dark:border-violet-300/12 dark:bg-white/8">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-violet-100/52">
        {label}
      </p>
      <p className="mt-1 font-semibold text-stone-950 dark:text-violet-50">
        {value}
      </p>
    </div>
  )
}

function ProfileMediaPreview({ post }) {
  const mediaUrl = post.mediaUrl ?? post.imageUrl
  const isVideo = post.mediaKind === 'video'

  return (
    <article className="overflow-hidden rounded-[24px] border border-violet-100 bg-white/78 dark:border-violet-300/12 dark:bg-white/8">
      {isVideo ? (
        <video src={mediaUrl} controls className="h-64 w-full object-cover sm:h-80" />
      ) : (
        <img src={mediaUrl} alt={post.content || 'Media du profil'} className="h-64 w-full object-cover sm:h-80" />
      )}
      <p className="line-clamp-2 px-4 py-3 text-sm text-stone-600 dark:text-violet-100/72">
        {post.content || 'Publication YaZoo'}
      </p>
    </article>
  )
}

function formatProfileDate(value) {
  if (!value) {
    return 'Non renseignee'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(244,237,255,0.96),_rgba(237,233,254,0.72))] px-4 py-4 text-center dark:bg-[linear-gradient(135deg,_rgba(124,58,237,0.18),_rgba(24,6,44,0.92))]">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-600 dark:text-violet-100/70">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-violet-50">
        {value}
      </p>
    </div>
  )
}

function filterPublications(publications, searchTerm) {
  const safePublications = asArray(publications)

  if (!searchTerm) {
    return safePublications
  }

  const normalizedSearch = normalizeSearchText(searchTerm)

  return safePublications.filter((post) =>
    [
      post.content,
      post.location,
      post.author?.name,
      post.author?.email,
      ...(post.tags ?? []),
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch)),
  )
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function addCommentToPost(post, comment) {
  const isReply = Boolean(comment.parentId)

  if (!isReply) {
    return {
      ...post,
      comments: [...(post.comments ?? []), comment],
      commentsCount: (post.commentsCount ?? post.comments?.length ?? 0) + 1,
    }
  }

  return {
    ...post,
    comments: (post.comments ?? []).map((currentComment) =>
      currentComment.id === comment.parentId
        ? {
            ...currentComment,
            replies: [...(currentComment.replies ?? []), comment],
          }
        : currentComment,
    ),
    commentsCount: (post.commentsCount ?? post.comments?.length ?? 0) + 1,
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

export default ProfilePage
