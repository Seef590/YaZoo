import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Avatar from './Avatar'

describe('Avatar', () => {
  it('affiche les initiales lorsque la ressource image est invalide', () => {
    render(<Avatar name="Admin YaZoo" src="https://invalid.test/avatar.png" />)

    fireEvent.error(screen.getByRole('img', { name: 'Admin YaZoo' }))

    expect(screen.queryByRole('img', { name: 'Admin YaZoo' })).not.toBeInTheDocument()
    expect(screen.getByText('AY')).toBeInTheDocument()
  })
})
