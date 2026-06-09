export function getErrorMessage(error, fallback = 'Une erreur est survenue.') {
  const responseData = error?.response?.data

  if (responseData?.errors) {
    const firstEntry = Object.values(responseData.errors)[0]

    if (Array.isArray(firstEntry) && firstEntry[0]) {
      return firstEntry[0]
    }
  }

  if (responseData?.message) {
    return responseData.message
  }

  return fallback
}
