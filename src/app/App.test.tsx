import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from '../features/auth/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

it('renders Spanish navigation and the map entry point', () => {
  const client = new QueryClient({defaultOptions:{queries:{retry:false}}})
  render(<QueryClientProvider client={client}><MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter></QueryClientProvider>)
  expect(screen.getByRole('link', { name: 'Explorar mapa' })).toHaveAttribute('href', '/mapa')
  expect(screen.getByRole('link', { name: 'Comunidad' })).toHaveAttribute('href', '/comunidad')
})
