export function asArray(value) {
  return Array.isArray(value) ? value : []
}

export function extractDataArray(response) {
  return asArray(response?.data?.data ?? response?.data)
}

export function extractDataObject(response, fallback = {}) {
  const data = response?.data?.data ?? response?.data

  return data && typeof data === 'object' && !Array.isArray(data) ? data : fallback
}
