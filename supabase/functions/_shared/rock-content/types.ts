export type EventScope = 'mexico' | 'international'
export type EventStatus = 'scheduled' | 'postponed' | 'cancelled' | 'completed'
export type NewsCategory = 'mexico' | 'international' | 'releases' | 'festivals' | 'other'

export type NormalizedRockEvent = {
  provider: 'ticketmaster'
  externalId: string
  name: string
  artistName: string
  description: string | null
  startsAt: string
  timezone: string | null
  venueName: string
  city: string
  state: string | null
  countryCode: string
  latitude: number | null
  longitude: number | null
  imageUrl: string | null
  ticketUrl: string
  genres: string[]
  scope: EventScope
  status: EventStatus
  sourceUpdatedAt: string | null
  lastSeenAt: string
}

export type RockNewsSourceInput = {
  id: string
  name: string
  countryCode: string
  allowedCategories: readonly NewsCategory[]
}

export type NormalizedRockArticle = {
  sourceId: string
  canonicalUrl: string
  urlHash: string
  title: string
  summary: string
  imageUrl: string | null
  publishedAt: string
  fetchedAt: string
  category: NewsCategory
}
