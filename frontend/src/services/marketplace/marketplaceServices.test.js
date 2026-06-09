import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createAnimalRequest,
  deleteAnimalRequest,
  getAnimalsRequest,
  updateAnimalRequest,
} from '../../api/animals'
import {
  createProductRequest,
  deleteProductRequest,
  getProductsRequest,
  updateProductRequest,
} from '../../api/products'
import * as animalsService from './animalsMarketplaceService'
import * as productsService from './productsMarketplaceService'

vi.mock('../../api/animals', () => ({
  createAnimalRequest: vi.fn(),
  deleteAnimalRequest: vi.fn(),
  getAnimalsRequest: vi.fn(),
  updateAnimalRequest: vi.fn(),
}))

vi.mock('../../api/products', () => ({
  createProductRequest: vi.fn(),
  deleteProductRequest: vi.fn(),
  getProductsRequest: vi.fn(),
  updateProductRequest: vi.fn(),
}))

describe('marketplace services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('nettoie les filtres et delegue les appels animaux', async () => {
    getAnimalsRequest.mockResolvedValue({ data: { data: [{ id: 1 }] } })

    await expect(animalsService.fetchAnimals({ q: 'Luna', category: '' })).resolves.toEqual([{ id: 1 }])
    animalsService.createAnimal('payload')
    animalsService.updateAnimal(2, 'payload')
    animalsService.deleteAnimal(3)

    expect(getAnimalsRequest).toHaveBeenCalledWith({ q: 'Luna' })
    expect(createAnimalRequest).toHaveBeenCalledWith('payload')
    expect(updateAnimalRequest).toHaveBeenCalledWith(2, 'payload')
    expect(deleteAnimalRequest).toHaveBeenCalledWith(3)
  })

  it('nettoie les filtres et delegue les appels produits', async () => {
    getProductsRequest.mockResolvedValue({ data: { data: [{ id: 4 }] } })

    await expect(productsService.fetchProducts({ q: 'Panier', category: '' })).resolves.toEqual([{ id: 4 }])
    productsService.createProduct('payload')
    productsService.updateProduct(5, 'payload')
    productsService.deleteProduct(6)

    expect(getProductsRequest).toHaveBeenCalledWith({ q: 'Panier' })
    expect(createProductRequest).toHaveBeenCalledWith('payload')
    expect(updateProductRequest).toHaveBeenCalledWith(5, 'payload')
    expect(deleteProductRequest).toHaveBeenCalledWith(6)
  })
})
