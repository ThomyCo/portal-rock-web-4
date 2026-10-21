import { getDisplayCoordinates } from './bandCoordinates'
import type { BandSummary } from '../bands/types'

const band = (id: string): BandSummary => ({
  id, slug: id, name: id, city: 'London', summary: '', formationYear: 1970,
  countryCode: 'GB', genres: ['rock'], longitude: -0.1276, latitude: 51.5072,
  heroImageUrl: null,
})

it('separates bands that share the same city without changing a single marker', () => {
  const single = [band('queen')]
  expect(getDisplayCoordinates(single[0], single)).toEqual([-0.1276, 51.5072])

  const shared = [band('queen'), band('pink-floyd')]
  expect(getDisplayCoordinates(shared[0], shared)).not.toEqual(getDisplayCoordinates(shared[1], shared))
})
