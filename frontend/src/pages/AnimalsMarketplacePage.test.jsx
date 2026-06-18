import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import AnimalsMarketplacePage from './AnimalsMarketplacePage'
import { I18nProvider } from '../contexts/I18nContext'
import * as animalService from '../services/marketplace/animalsMarketplaceService'

vi.mock('../services/marketplace/animalsMarketplaceService', () => ({
  createAnimal: vi.fn(),
  deleteAnimal: vi.fn(),
  fetchAnimals: vi.fn(),
  updateAnimal: vi.fn(),
}))

describe('AnimalsMarketplacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('yazoo-locale', 'fr')
    animalService.fetchAnimals.mockResolvedValue([])
    animalService.createAnimal.mockResolvedValue({ data: {} })
    animalService.updateAnimal.mockResolvedValue({ data: {} })
    animalService.deleteAnimal.mockResolvedValue({ data: {} })
  })

  it('soumet le formulaire de creation d annonce animal', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <I18nProvider>
          <AnimalsMarketplacePage />
        </I18nProvider>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: /Ajouter un animal/i }))
    const heading = await screen.findByRole('heading', { name: 'Creer une annonce animal' })
    const publicationForm = heading.closest('form')

    expect(publicationForm).not.toBeNull()

    await user.type(within(publicationForm).getByLabelText('Nom'), 'Luna')
    await user.type(within(publicationForm).getByLabelText('Type'), 'Chien')
    await user.type(within(publicationForm).getByLabelText('Localisation'), 'Rabat')
    await user.type(within(publicationForm).getByLabelText('Description'), 'Jeune chienne douce')
    await user.click(within(publicationForm).getByRole('button', { name: "Publier l'annonce" }))

    await waitFor(() => {
      expect(animalService.createAnimal).toHaveBeenCalledTimes(1)
    })

    const formData = animalService.createAnimal.mock.calls[0][0]

    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('name')).toBe('Luna')
    expect(formData.get('type')).toBe('Chien')
    expect(formData.get('location')).toBe('Rabat')
    expect(formData.get('listing_status')).toBe('available')
    expect(await screen.findByText('Annonce animal creee avec succes.')).toBeInTheDocument()
  })
})
