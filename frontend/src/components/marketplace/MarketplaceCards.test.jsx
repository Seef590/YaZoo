import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import AnimalCard from './AnimalCard'
import ProductCard from './ProductCard'
import { I18nProvider } from '../../contexts/I18nContext'

const animal = {
  id: 1,
  name: 'Luna',
  category: 'dog',
  type: 'Chien',
  breed: 'Berger',
  age: 2,
  sex: 'female',
  location: 'Rabat',
  price: 950,
  isForAdoption: false,
  listingStatus: 'available',
  description: 'Douce et sociable',
  photoUrl: 'https://example.com/luna.webp',
  galleryUrls: ['https://example.com/luna-2.webp'],
  createdAt: '2026-04-07T10:00:00.000Z',
  author: {
    id: 42,
    name: 'Sara Seller',
    email: 'sara@yazoo.app',
  },
}

const product = {
  id: 2,
  name: 'Panier velours',
  category: 'accessory',
  conditionStatus: 'used',
  location: 'Marrakech',
  price: 240,
  stock: 3,
  listingStatus: 'reserved',
  description: 'Confortable',
  imageUrl: 'https://example.com/panier.webp',
  galleryUrls: ['https://example.com/panier-2.webp'],
  createdAt: '2026-04-07T10:00:00.000Z',
  author: {
    id: 84,
    name: 'Boutique YaZoo',
    email: 'shop@yazoo.app',
  },
}

function renderWithRouter(ui) {
  localStorage.setItem('yazoo-locale', 'fr')

  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nProvider>{ui}</I18nProvider>
    </MemoryRouter>,
  )
}

describe('marketplace cards', () => {
  it('affiche les actions proprietaire pour une annonce animal', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    renderWithRouter(
      <AnimalCard animal={{ ...animal, isOwner: true }} onEdit={onEdit} onDelete={onDelete} />,
    )

    expect(screen.getByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.getAllByText('Chiens').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Modifier' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('affiche le contact pour une annonce animal externe', () => {
    renderWithRouter(
      <AnimalCard animal={{ ...animal, isOwner: false }} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      expect.stringContaining('user=42'),
    )
  })

  it('affiche les badges de confiance disponibles sur une carte animal', () => {
    renderWithRouter(
      <AnimalCard
        animal={{
          ...animal,
          isOwner: false,
          sellerType: 'professional',
          documentaryStatus: 'documents_verified_by_yazoo',
          author: {
            ...animal.author,
            isPhoneVerified: true,
            isProfessionalVerified: true,
          },
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Documents verifies par YaZoo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Professionnel').length).toBeGreaterThan(0)
    expect(screen.getByText('Paiement a la remise')).toBeInTheDocument()
    expect(screen.getByText('Virement bancaire')).toBeInTheDocument()
  })

  it('affiche uniquement les preuves sociales fournies par l API', () => {
    renderWithRouter(
      <AnimalCard
        animal={{
          ...animal,
          isOwner: false,
          averageRating: 4.5,
          reviewsCount: 2,
          isFavorited: true,
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('2 avis')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retirer des favoris' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('n affiche pas de fausse note ni badge professionnel sans donnee API', () => {
    renderWithRouter(
      <AnimalCard
        animal={{
          ...animal,
          isOwner: false,
          averageRating: null,
          reviewsCount: 0,
          author: {
            ...animal.author,
            isProfessionalVerified: false,
          },
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
    expect(screen.queryByText('*****')).not.toBeInTheDocument()
    expect(screen.queryByText('Documents verifies par YaZoo')).not.toBeInTheDocument()
  })

  it('affiche un lien telephone quand une annonce animal externe n a pas d auteur', () => {
    renderWithRouter(
      <AnimalCard
        animal={{
          ...animal,
          author: { name: 'Contact direct' },
          contactPhone: '+212 606 610 014',
          isOwner: false,
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      'https://wa.me/212606610014',
    )
  })

  it('affiche les actions proprietaire pour un produit', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    renderWithRouter(
      <ProductCard product={{ ...product, isOwner: true }} onEdit={onEdit} onDelete={onDelete} />,
    )

    expect(screen.getByRole('heading', { name: 'Panier velours' })).toBeInTheDocument()
    expect(screen.getAllByText('Occasion').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Modifier' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }))
    expect(onDelete).toHaveBeenCalledWith(2)
  })

  it('affiche le contact pour un produit externe', () => {
    renderWithRouter(
      <ProductCard product={{ ...product, isOwner: false }} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      expect.stringContaining('user=84'),
    )
  })

  it('affiche un lien telephone quand un produit externe n a pas d auteur', () => {
    renderWithRouter(
      <ProductCard
        product={{
          ...product,
          author: { name: 'Contact direct' },
          contactPhone: '+212 606 610 014',
          isOwner: false,
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'Contacter' })).toHaveAttribute(
      'href',
      'https://wa.me/212606610014',
    )
  })
})
