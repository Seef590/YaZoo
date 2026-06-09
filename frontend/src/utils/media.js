export function versionMediaUrl(url, version) {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return url ?? ''
  }

  const hashIndex = url.indexOf('#')
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const withoutVersion = withoutHash
    .replace(/([?&])v=[^&]*/g, '$1')
    .replace(/[?&]$/, '')
  const separator = withoutVersion.includes('?') ? '&' : '?'
  const safeVersion = encodeURIComponent(String(version ?? Date.now()))

  return `${withoutVersion}${separator}v=${safeVersion}${hash}`
}

export function normalizeProfileMediaPayload(profile) {
  if (!profile) {
    return profile
  }

  const version = profile.mediaVersion ?? profile.updatedAt ?? Date.now()

  return {
    ...profile,
    avatar: versionMediaUrl(profile.avatar, version),
    coverPhoto: versionMediaUrl(profile.coverPhoto, version),
  }
}

export function normalizeAuthUserMedia(user) {
  if (!user) {
    return user
  }

  const version = user.mediaVersion ?? user.updated_at ?? Date.now()

  return {
    ...user,
    avatar: versionMediaUrl(user.avatar, version),
    cover_photo: versionMediaUrl(user.cover_photo, version),
  }
}
