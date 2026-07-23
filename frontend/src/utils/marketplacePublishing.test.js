import { describe, expect, it } from 'vitest'

import {
  getMarketplacePublishRoute,
  PROFESSIONAL_VERIFICATION_ROUTE,
} from './marketplacePublishing'

const approvedCapability = {
  canPublish: true,
  verificationStatus: 'approved',
  serviceType: null,
}

describe('getMarketplacePublishRoute', () => {
  it.each([
    ['products', null, '/marketplace/products?create=1'],
    ['animals', null, '/marketplace/animals?create=1'],
    ['veterinarians', null, '/marketplace/veterinarians?create=1'],
    ['services', null, '/marketplace/services?create=1'],
    ['services', 'training', '/marketplace/services?create=1&type=training'],
  ])('limite %s/%s a une route de creation connue', (destination, serviceType, route) => {
    expect(getMarketplacePublishRoute({
      ...approvedCapability,
      destination,
      serviceType,
    })).toBe(route)
  })

  it.each([
    undefined,
    { canPublish: false },
    { ...approvedCapability, destination: 'unknown' },
    { ...approvedCapability, destination: 'services', serviceType: 'unknown' },
    { ...approvedCapability, verificationStatus: 'expired', destination: 'products' },
  ])('redirige une capacite invalide vers la verification', (capability) => {
    expect(getMarketplacePublishRoute(capability)).toBe(PROFESSIONAL_VERIFICATION_ROUTE)
  })
})
