export type Bounds = [number, number, number, number]
export type BandFilters = { bounds?: Bounds; genre?: string; decade?: number; country?: string; query?: string }
export type BandSummary = { id: string; slug: string; name: string; city: string; summary: string; formationYear: number; countryCode: string; genres: string[]; longitude: number; latitude: number; heroImageUrl: string | null }
export type BandDetail = BandSummary & { biography: string; sourceUrl: string; websiteUrl?: string; albums: string[] }
