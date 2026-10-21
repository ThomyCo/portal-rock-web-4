import type { BandSummary } from '../bands/types'

export function getDisplayCoordinates(band: BandSummary, bands: BandSummary[]): [number, number] {
  const samePlace = bands.filter(item => item.longitude === band.longitude && item.latitude === band.latitude)
  if (samePlace.length < 2) return [band.longitude, band.latitude]

  const index = samePlace.findIndex(item => item.id === band.id)
  const angle = (index / samePlace.length) * Math.PI * 2
  const radius = 0.035
  return [band.longitude + Math.cos(angle) * radius, band.latitude + Math.sin(angle) * radius]
}
