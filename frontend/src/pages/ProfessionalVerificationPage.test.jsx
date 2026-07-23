import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProfessionalVerificationPage from './ProfessionalVerificationPage'
import { I18nProvider } from '../contexts/I18nContext'
import {
  createProfessionalVerificationRequest,
  getMyProfessionalVerificationsRequest,
} from '../api/professionalVerifications'

vi.mock('../api/professionalVerifications', () => ({
  createProfessionalVerificationRequest: vi.fn(),
  getMyProfessionalVerificationsRequest: vi.fn(),
}))

describe('ProfessionalVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('yazoo-locale', 'fr')
    getMyProfessionalVerificationsRequest.mockResolvedValue({ data: { data: [] } })
  })

  it('propose les categories vendeur et dresseur sans retirer les anciennes', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <I18nProvider>
          <ProfessionalVerificationPage />
        </I18nProvider>
      </MemoryRouter>,
    )

    const businessType = await screen.findByLabelText(/type d.*activité|type d.*activite/i)

    const options = Array.from(businessType.options).map((option) => ({
      label: option.textContent,
      value: option.value,
    }))

    expect(options).toEqual(expect.arrayContaining([
      { value: 'seller', label: 'Vendeur' },
      { value: 'trainer', label: 'Dresseur' },
      { value: 'veterinarian', label: 'Veterinaire' },
    ]))
    expect(createProfessionalVerificationRequest).not.toHaveBeenCalled()
  })
})
