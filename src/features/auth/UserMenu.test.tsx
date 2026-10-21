import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { UserMenu } from './UserMenu'

jest.mock('./AuthProvider', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = useAuth as jest.Mock

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>
}

it('shows the login option when there is no authenticated user', () => {
  mockedUseAuth.mockReturnValue({ user: null, profile: null, loading: false, signOut: jest.fn() })
  render(<MemoryRouter><UserMenu /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', '/acceso')
})

it('shows account information and available actions for an authenticated user', async () => {
  mockedUseAuth.mockReturnValue({
    user: { email: 'luna@example.com' },
    profile: { display_name: 'Luna Distorsión', username: 'luna', role: 'member' },
    loading: false,
    signOut: jest.fn(),
  })
  render(<MemoryRouter><UserMenu /></MemoryRouter>)

  expect(screen.queryByRole('link', { name: 'Ingresar' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }))
  expect(screen.getByText('Luna Distorsión')).toBeInTheDocument()
  expect(screen.getByText('@luna')).toBeInTheDocument()
  expect(screen.getByText('luna@example.com')).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toHaveAttribute('href', '/perfil')
  expect(screen.queryByRole('menuitem', { name: 'Panel de administración' })).not.toBeInTheDocument()
})

it('signs out, closes the menu and returns to the home page', async () => {
  const signOut = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({
    user: { email: 'admin@example.com' },
    profile: { display_name: 'Admin Rock', username: 'admin', role: 'admin' },
    loading: false,
    signOut,
  })
  render(<MemoryRouter initialEntries={['/mapa']}><UserMenu /><LocationProbe /></MemoryRouter>)

  await userEvent.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }))
  expect(screen.getByRole('menuitem', { name: 'Panel de administración' })).toHaveAttribute('href', '/admin')
  await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))

  await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1))
  expect(screen.getByTestId('location')).toHaveTextContent('/')
})
