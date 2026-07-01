import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from './I18nContext'
import { ToastProvider } from './ToastContext'
import { useToast } from '../hooks/useToast'

function ToastProbe() {
  const { showToast } = useToast()

  return (
    <button
      type="button"
      onClick={() => showToast({ title: 'Info test', description: 'Toast sans hasard' })}
    >
      Show toast
    </button>
  )
}

describe('ToastProvider', () => {
  it('cree un toast sans utiliser Math.random pour son identifiant', async () => {
    const randomSpy = vi.spyOn(Math, 'random')

    render(
      <I18nProvider>
        <ToastProvider>
          <ToastProbe />
        </ToastProvider>
      </I18nProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show toast' }))

    expect(screen.getByText('Info test')).toBeInTheDocument()
    expect(screen.getByText('Toast sans hasard')).toBeInTheDocument()
    expect(randomSpy).not.toHaveBeenCalled()

    randomSpy.mockRestore()
  })
})
