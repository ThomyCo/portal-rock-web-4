import type { EventScope, EventStatus, NormalizedRockEvent } from './types'

const ROCK_TERMS = ['rock', 'metal', 'punk', 'alternative', 'alternativo']

function object(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? value as Record<string, any> : {}
}

function https(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('https://') ? value : null
}

function statusOf(code: unknown): EventStatus {
  if (code === 'cancelled' || code === 'canceled') return 'cancelled'
  if (code === 'postponed' || code === 'rescheduled') return 'postponed'
  if (code === 'offsale') return 'completed'
  return 'scheduled'
}

export function normalizeTicketmasterEvents(payload: unknown, scope: EventScope, fetchedAt: Date): NormalizedRockEvent[] {
  const events = object(object(payload)._embedded).events
  if (!Array.isArray(events)) return []
  return events.flatMap(raw => {
    const event = object(raw)
    const classifications = Array.isArray(event.classifications) ? event.classifications : []
    const genres = classifications.flatMap(item => {
      const classification = object(item)
      return [object(classification.genre).name, object(classification.subGenre).name]
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim().toLowerCase())
    })
    if (!genres.some(genre => ROCK_TERMS.some(term => genre.includes(term)))) return []
    const ticketUrl = https(event.url)
    const startsAt = object(object(event.dates).start).dateTime
    if (!ticketUrl || typeof startsAt !== 'string' || typeof event.id !== 'string') return []
    const embedded = object(event._embedded)
    const venue = object(Array.isArray(embedded.venues) ? embedded.venues[0] : null)
    const attraction = object(Array.isArray(embedded.attractions) ? embedded.attractions[0] : null)
    const location = object(venue.location)
    const images = Array.isArray(event.images) ? event.images : []
    const image = [...images].sort((a, b) => Number(object(b).width || 0) - Number(object(a).width || 0)).find(item => https(object(item).url))
    const numberOrNull = (value: unknown) => value == null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value)
    return [{
      provider: 'ticketmaster' as const,
      externalId: event.id,
      name: String(event.name || attraction.name || 'Evento de rock'),
      artistName: String(attraction.name || event.name || 'Artista por confirmar'),
      description: typeof event.info === 'string' ? event.info : null,
      startsAt,
      timezone: typeof object(event.dates).timezone === 'string' ? object(event.dates).timezone : null,
      venueName: String(venue.name || 'Recinto por confirmar'),
      city: String(object(venue.city).name || 'Ciudad por confirmar'),
      state: typeof object(venue.state).name === 'string' ? object(venue.state).name : null,
      countryCode: String(object(venue.country).countryCode || (scope === 'mexico' ? 'MX' : 'XX')).toUpperCase(),
      latitude: numberOrNull(location.latitude),
      longitude: numberOrNull(location.longitude),
      imageUrl: image ? https(object(image).url) : null,
      ticketUrl,
      genres: [...new Set(genres)],
      scope,
      status: statusOf(object(object(event.dates).status).code),
      sourceUpdatedAt: typeof event._dates === 'object' && typeof object(event._dates).lastUpdated === 'string' ? object(event._dates).lastUpdated : null,
      lastSeenAt: fetchedAt.toISOString(),
    }]
  })
}
