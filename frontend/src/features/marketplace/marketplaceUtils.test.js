import { describe, expect, it } from 'vitest'

import {
  buildAnimalContactPath,
  buildAnimalFormData,
  buildProductContactPath,
  buildProductFormData,
  cleanFilters,
  countActiveFilters,
  formatAnimalCategory,
  formatAnimalSex,
  formatAnimalStatus,
  formatCondition,
  formatFiltersSummary,
  formatProductCategory,
  formatProductStatus,
  uniqueUrls,
} from './marketplaceUtils'

describe('marketplaceUtils', () => {
  it('nettoie et resume les filtres', () => {
    const filters = { q: 'chat', category: '', location: 'Rabat' }

    expect(cleanFilters(filters)).toEqual({ q: 'chat', location: 'Rabat' })
    expect(countActiveFilters(filters)).toBe(2)
    expect(formatFiltersSummary(0)).toBe('Aucun filtre actif')
    expect(formatFiltersSummary(1)).toBe('1 filtre actif')
    expect(formatFiltersSummary(2)).toBe('2 filtres actifs')
  })

  it('prepare les donnees formulaire animal', () => {
    const image = new File(['image'], 'luna.webp', { type: 'image/webp' })
    const gallery = new File(['gallery'], 'luna-2.webp', { type: 'image/webp' })
    const form = {
      name: 'Luna',
      category: 'dog',
      type: 'Chien',
      breed: 'Berger',
      age: '2',
      sex: 'female',
      location: 'Rabat',
      price: '950',
      is_for_adoption: false,
      listing_status: 'available',
      description: 'Douce',
      contact_phone: '+212600000000',
      accepts_animal_rules: true,
      seller_type: 'professional',
      origin: 'Rabat',
      identification_number: 'ID-123',
      health_certificate_path: 'private/health.pdf',
      vaccination_book_path: 'private/vaccine.pdf',
      onssa_authorization_number: 'ONSSA-123',
      existing_photo_path: 'old/main.webp',
      existing_gallery_paths: ['old/gallery.webp'],
    }

    const payload = buildAnimalFormData(form, image, [gallery])

    expect(payload.get('name')).toBe('Luna')
    expect(payload.get('is_for_adoption')).toBe('0')
    expect(payload.get('contact_phone')).toBe('+212600000000')
    expect(payload.get('accepts_animal_rules')).toBe('1')
    expect(payload.get('seller_type')).toBe('professional')
    expect(payload.get('origin')).toBe('Rabat')
    expect(payload.get('onssa_authorization_number')).toBe('ONSSA-123')
    expect(payload.get('photo')).toBe(image)
    expect(payload.getAll('gallery_urls[]')).toEqual(['old/gallery.webp'])
    expect(payload.getAll('gallery_files[]')).toEqual([gallery])
  })

  it('prepare les donnees formulaire produit', () => {
    const image = new File(['image'], 'panier.webp', { type: 'image/webp' })
    const form = {
      name: 'Panier',
      category: 'accessory',
      description: 'Velours',
      price: '240',
      location: 'Marrakech',
      stock: 3,
      listing_status: 'available',
      condition_status: 'new',
      existing_image_path: 'old/product.webp',
      existing_gallery_paths: ['old/side.webp'],
    }

    const payload = buildProductFormData(form, image, [])

    expect(payload.get('name')).toBe('Panier')
    expect(payload.get('stock')).toBe('3')
    expect(payload.get('image')).toBe(image)
    expect(payload.getAll('gallery_urls[]')).toEqual(['old/side.webp'])
  })

  it('formate les libelles et chemins de contact', () => {
    const animal = { name: 'Luna', author: { id: 42, email: 'seller@yazoo.app' } }
    const product = { name: 'Panier', author: { id: 84, email: 'shop@yazoo.app' } }

    expect(uniqueUrls(['a', 'a', '', 'b'])).toEqual(['a', 'b'])
    expect(formatAnimalCategory('dog')).toBe('Chiens')
    expect(formatAnimalCategory('unknown')).toBe('Autres')
    expect(formatAnimalStatus('sold')).toBe('Vendu')
    expect(formatAnimalStatus('unknown')).toBe('Disponible')
    expect(formatAnimalSex('female')).toBe('Femelle')
    expect(formatAnimalSex('unknown-value')).toBe('Inconnu')
    expect(formatProductCategory('food')).toBe('Alimentation')
    expect(formatProductCategory('unknown')).toBe('Autres')
    expect(formatProductStatus('reserved')).toBe('Reserve')
    expect(formatProductStatus('unknown')).toBe('Disponible')
    expect(formatCondition('used')).toBe('Occasion')
    expect(formatCondition('new')).toBe('Neuf')
    expect(buildAnimalContactPath(animal)).toContain('user=42')
    expect(buildProductContactPath(product)).toContain('user=84')
  })
})
