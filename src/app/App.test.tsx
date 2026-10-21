import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from '../features/auth/AuthProvider'

it('renders Spanish navigation and the map entry point', () => {
  render(<MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Explorar mapa' })).toHaveAttribute('href', '/mapa')
  expect(screen.getByRole('link', { name: 'Comunidad' })).toHaveAttribute('href', '/comunidad')
})
