import { hasSupabase, supabase } from '../../lib/supabase'
import type { HomeContent, HomeEvent, HomeNewsItem, NewsCategory } from './types'

type RawNews = Record<string, any>
type RawEvent = Record<string, any>
type RawBand = { name:string;slug:string }

export function normalizeArtistName(value:string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
}

export function buildHomeContent(rawNews:RawNews[],rawEvents:RawEvent[],bands:RawBand[]):HomeContent {
  const bandIndex = new Map(bands.map(band => [normalizeArtistName(band.name),band.slug]))
  const news:HomeNewsItem[] = rawNews.map(item => ({
    id:item.id,title:item.title,summary:item.summary,url:item.canonical_url,imageUrl:item.image_url,publishedAt:item.published_at,
    category:item.category as NewsCategory,featured:Boolean(item.featured),editorialOrder:item.editorial_order,sourceName:item.source_name,
  })).sort((a,b) => Number(b.featured)-Number(a.featured) || (a.editorialOrder??9999)-(b.editorialOrder??9999) || Date.parse(b.publishedAt)-Date.parse(a.publishedAt))
  const mapped:HomeEvent[] = rawEvents.map(item => ({
    id:item.id,name:item.name,artistName:item.artist_name,startsAt:item.starts_at,venueName:item.venue_name,city:item.city,state:item.state,
    countryCode:item.country_code,imageUrl:item.image_url,ticketUrl:item.ticket_url,scope:item.scope,status:item.status,genres:item.genres??[],
    bandSlug:bandIndex.get(normalizeArtistName(item.artist_name))??null,
  })).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))
  return { news, mexicoEvents:mapped.filter(item=>item.scope==='mexico'), internationalEvents:mapped.filter(item=>item.scope==='international') }
}

export async function getHomeContent(_now = new Date()):Promise<HomeContent> {
  if(!hasSupabase)return{news:[],mexicoEvents:[],internationalEvents:[]}
  const [newsResult,eventResult,bandResult] = await Promise.all([
    supabase.from('public_rock_news').select('*').order('featured',{ascending:false}).order('editorial_order',{ascending:true}).order('published_at',{ascending:false}),
    supabase.from('public_rock_events').select('*').order('starts_at',{ascending:true}),
    supabase.from('public_band_catalog').select('name,slug'),
  ])
  const error = newsResult.error || eventResult.error || bandResult.error
  if(error)throw error
  return buildHomeContent((newsResult.data??[]) as RawNews[],(eventResult.data??[]) as RawEvent[],(bandResult.data??[]) as RawBand[])
}
