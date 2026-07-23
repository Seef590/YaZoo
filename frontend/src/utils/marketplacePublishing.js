export const PROFESSIONAL_VERIFICATION_ROUTE = '/settings/professional-verification'

const MARKETPLACE_CREATE_ROUTES = {
  animals: '/marketplace/animals?create=1',
  products: '/marketplace/products?create=1',
  veterinarians: '/marketplace/veterinarians?create=1',
}

export function getMarketplacePublishRoute(capability) {
  if (
    capability?.canPublish !== true
    || capability?.verificationStatus !== 'approved'
  ) {
    return PROFESSIONAL_VERIFICATION_ROUTE
  }

  if (capability.destination === 'services') {
    if (capability.serviceType === 'training') {
      return '/marketplace/services?create=1&type=training'
    }

    return capability.serviceType == null
      ? '/marketplace/services?create=1'
      : PROFESSIONAL_VERIFICATION_ROUTE
  }

  return MARKETPLACE_CREATE_ROUTES[capability.destination]
    ?? PROFESSIONAL_VERIFICATION_ROUTE
}
