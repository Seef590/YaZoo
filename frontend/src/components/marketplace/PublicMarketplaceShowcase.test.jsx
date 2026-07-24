import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPublicMarketplacePreviewRequest } from '../../api/publicMarketplace'
import { I18nProvider } from '../../contexts/I18nContext'
import PublicMarketplaceShowcase from './PublicMarketplaceShowcase'

vi.mock('../../api/publicMarketplace', () => ({
  getPublicMarketplacePreviewRequest: vi.fn(),
}))

const emptyResponse = {
  data: {
    data: {
      animals: [],
      products: [],
      services: [],
      veterinarians: [],
    },
  },
}

describe('PublicMarketplaceShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('yazoo-locale', 'fr')
  })

  it('affiche les annonces publiques et dirige les actions privées vers l’authentification', async () => {
    getPublicMarketplacePreviewRequest.mockResolvedValue({
      data: {
        data: {
          ...emptyResponse.data.data,
          animals: [
            {
              id: 1,
              type: 'animal',
              title: 'Luna',
              subtitle: 'Chat',
              description: 'Animal sociable',
              location: 'Sefrou',
              price: null,
              imageUrl: null,
              badge: 'adoption',
              createdAt: '2026-07-24T12:00:00.000Z',
              author: { name: 'Association locale', avatar: null },
            },
          ],
        },
      },
    })

    renderShowcase()

    expect(
      await screen.findByRole('heading', {
        name: 'Les dernières annonces du Marché YaZoo',
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Luna')).toBeInTheDocument()
    expect(screen.getByText('Adoption')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voir les détails' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: 'Publier une annonce' })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('affiche un état vide pour chacune des quatre catégories', async () => {
    getPublicMarketplacePreviewRequest.mockResolvedValue(emptyResponse)

    renderShowcase()

    expect(
      await screen.findAllByText(
        'Aucune annonce approuvée dans cette catégorie pour le moment.',
      ),
    ).toHaveLength(4)
  })

  it('affiche une erreur compréhensible et permet de relancer le chargement', async () => {
    getPublicMarketplacePreviewRequest
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(emptyResponse)

    renderShowcase()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Les annonces publiques sont temporairement indisponibles.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    expect(
      await screen.findAllByText(
        'Aucune annonce approuvée dans cette catégorie pour le moment.',
      ),
    ).toHaveLength(4)
    expect(getPublicMarketplacePreviewRequest).toHaveBeenCalledTimes(2)
  })

  it('respecte la direction RTL en arabe', async () => {
    localStorage.setItem('yazoo-locale', 'ar')
    getPublicMarketplacePreviewRequest.mockResolvedValue(emptyResponse)

    renderShowcase()

    expect(
      await screen.findByRole('heading', { name: 'أحدث إعلانات سوق YaZoo' }),
    ).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  })
})

function renderShowcase() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <PublicMarketplaceShowcase />
      </I18nProvider>
    </MemoryRouter>,
  )
}
