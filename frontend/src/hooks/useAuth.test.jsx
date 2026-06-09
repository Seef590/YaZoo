import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthContext } from '../contexts/auth-context'
import { useAuth } from './useAuth'

function Harness() {
  const { user } = useAuth()

  return <p>{user.name}</p>
}

describe('useAuth', () => {
  it('retourne le contexte auth courant', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Sara' } }}>
        <Harness />
      </AuthContext.Provider>,
    )

    expect(screen.getByText('Sara')).toBeInTheDocument()
  })

})
