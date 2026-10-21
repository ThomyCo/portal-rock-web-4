import type { BandSummary } from '../bands/types'

export function createBandPreview(band: BandSummary): HTMLElement {
  const card = document.createElement('article')
  card.className = 'band-map-preview'

  const location = document.createElement('p')
  location.className = 'band-map-preview__location'
  location.textContent = band.city

  const name = document.createElement('h2')
  name.textContent = band.name

  const details = document.createElement('p')
  details.className = 'band-map-preview__details'
  details.textContent = `${band.formationYear} · ${band.genres.slice(0, 2).join(' · ')}`

  const link = document.createElement('a')
  link.href = `/bandas/${band.slug}`
  link.textContent = 'Ver historia'

  card.append(location, name, details, link)
  return card
}
