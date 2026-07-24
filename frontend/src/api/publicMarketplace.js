import api from './client'

export const getPublicMarketplacePreviewRequest = (perSection = 6) =>
  api.get('/marketplace/public-preview', {
    params: {
      per_section: perSection,
    },
    skipAuthSessionExpired: true,
    skipGlobalErrorToast: true,
  })
