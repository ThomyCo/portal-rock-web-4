import { createBandPreview } from './bandPreview'
import type { BandSummary } from '../bands/types'

const band: BandSummary = {
  id: 'beatles-id', slug: 'the-beatles', name: 'The Beatles', city: 'Liverpool',
  summary: 'Una banda decisiva para la música popular.', formationYear: 1960,
  countryCode: 'GB', genres: ['rock'], longitude: -2.9916, latitude: 53.4084,
  heroImageUrl: null,
}

it('creates an accessible preview with city and band details', () => {
  const preview = createBandPreview(band)
  expect(preview).toHaveTextContent('The Beatles')
  expect(preview).toHaveTextContent('Liverpool')
  expect(preview).toHaveTextContent('1960')
  expect(preview.querySelector('a')).toHaveAttribute('href', '/bandas/the-beatles')
})
