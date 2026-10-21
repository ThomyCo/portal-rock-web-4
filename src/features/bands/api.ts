import { hasSupabase, supabase } from '../../lib/supabase'
import { demoBands } from './demoCatalog'
import type { BandDetail, BandFilters, BandSummary } from './types'

export function filterDemoBands(filters: BandFilters = {}): BandSummary[] {
  return demoBands.filter((band) => {
    const [west,south,east,north] = filters.bounds ?? [-180,-90,180,90]
    return band.longitude >= west && band.longitude <= east && band.latitude >= south && band.latitude <= north
      && (!filters.genre || band.genres.includes(filters.genre))
      && (!filters.decade || band.formationYear >= filters.decade && band.formationYear < filters.decade + 10)
      && (!filters.country || band.countryCode === filters.country)
      && (!filters.query || `${band.name} ${band.city} ${band.summary}`.toLocaleLowerCase().includes(filters.query.toLocaleLowerCase()))
  })
}

export async function listBands(filters: BandFilters = {}): Promise<BandSummary[]> {
  if (!hasSupabase) return filterDemoBands(filters)
  const [min_long,min_lat,max_long,max_lat] = filters.bounds ?? [-180,-90,180,90]
  const { data, error } = await supabase.rpc('bands_in_view', { min_lat, min_long, max_lat, max_long, genre_slug: filters.genre ?? null, decade: filters.decade ?? null, country: filters.country ?? null, query: filters.query ?? null })
  if (error) throw error
  return (data ?? []) as BandSummary[]
}

export async function getBand(slug: string): Promise<BandDetail> {
  if (!hasSupabase) { const band = demoBands.find((item) => item.slug === slug); if (!band) throw new Error('Banda no encontrada'); return band }
  const { data, error } = await supabase.from('public_band_catalog').select('*').eq('slug', slug).single()
  if (error) throw error
  return data as unknown as BandDetail
}
