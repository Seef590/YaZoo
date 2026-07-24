const GOOGLE_AUTH_ERROR_KEYS = {
  login: {
    google_not_configured: 'auth.login.googleNotConfigured',
    google: 'auth.login.googleFailed',
  },
  register: {
    google_not_configured: 'auth.register.googleNotConfigured',
    google: 'auth.register.googleFailed',
  },
}

export function getGoogleAuthErrorMessage(authError, flow, translate) {
  const translationKey = GOOGLE_AUTH_ERROR_KEYS[flow]?.[authError]

  return translationKey ? translate(translationKey) : ''
}
