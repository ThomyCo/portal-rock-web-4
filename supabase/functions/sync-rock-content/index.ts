import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdmin } from '../_shared/auth.ts'
import { SyncConflictError, syncRockContent } from '../_shared/rock-content/sync.ts'
import type { NormalizedRockArticle, NormalizedRockEvent } from '../_shared/rock-content/types.ts'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  const syncSecret = Deno.env.get('SYNC_CONTENT_SECRET')
  const scheduled = Boolean(syncSecret && request.headers.get('x-sync-secret') === syncSecret)
  if (!scheduled) {
    try { await requireAdmin(request) } catch (response) { return response as Response }
  }
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const ticketmasterKey = Deno.env.get('TICKETMASTER_API_KEY')
  if (!url || !serviceKey || !ticketmasterKey || !syncSecret) return json({ error: 'Faltan secretos del servidor' }, 500)
  const client = createClient(url, serviceKey, { auth: { persistSession: false } })
  const mapEvent = (event: NormalizedRockEvent) => ({
    provider:event.provider,external_id:event.externalId,name:event.name,artist_name:event.artistName,description:event.description,
    starts_at:event.startsAt,timezone:event.timezone,venue_name:event.venueName,city:event.city,state:event.state,country_code:event.countryCode,
    latitude:event.latitude,longitude:event.longitude,image_url:event.imageUrl,ticket_url:event.ticketUrl,genres:event.genres,scope:event.scope,
    status:event.status,source_updated_at:event.sourceUpdatedAt,last_seen_at:event.lastSeenAt,updated_at:new Date().toISOString(),
  })
  const mapArticle = (article: NormalizedRockArticle) => ({
    source_id:article.sourceId,canonical_url:article.canonicalUrl,url_hash:article.urlHash,title:article.title,summary:article.summary,
    image_url:article.imageUrl,published_at:article.publishedAt,fetched_at:article.fetchedAt,category:article.category,updated_at:new Date().toISOString(),
  })
  try {
    const summary = await syncRockContent({
      now: () => new Date(), sleep: ms => new Promise(resolve => setTimeout(resolve, ms)), ticketmasterKey,
      fetchResponse: (target, init) => fetch(target, init),
      tryStartRun: async trigger => { const { data, error } = await client.from('content_sync_runs').insert({ trigger_kind:trigger,status:'running' }).select('id').single(); if(error?.code==='23505')return null;if(error)throw error;return data.id },
      listSources: async () => { const {data,error}=await client.from('rock_news_sources').select('id,name,feed_url,country_code,allowed_categories').eq('active',true);if(error)throw error;return(data??[]).map(row=>({id:row.id,name:row.name,feedUrl:row.feed_url,countryCode:row.country_code,allowedCategories:row.allowed_categories})) },
      upsertEvents: async events => { if(!events.length)return{inserted:0,updated:0};const{error}=await client.from('rock_events').upsert(events.map(mapEvent),{onConflict:'provider,external_id'});if(error)throw error;return{inserted:0,updated:events.length} },
      upsertArticles: async articles => { if(!articles.length)return{inserted:0,updated:0};const{error}=await client.from('rock_news').upsert(articles.map(mapArticle),{onConflict:'url_hash'});if(error)throw error;return{inserted:0,updated:articles.length} },
      markSourceResult: async (id,errorMessage) => { const{error}=await client.from('rock_news_sources').update({last_success_at:errorMessage?undefined:new Date().toISOString(),last_error:errorMessage,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error },
      finishRun: async (id,summary) => { const{error}=await client.from('content_sync_runs').update({status:summary.status,finished_at:new Date().toISOString(),inserted_counts:summary.inserted,updated_counts:summary.updated,warnings:summary.warnings}).eq('id',id);if(error)throw error },
    }, { triggerKind: scheduled ? 'cron' : 'manual' })
    return json(summary)
  } catch (error) {
    if (error instanceof SyncConflictError) return json({ error: 'Ya hay una sincronización en curso' }, 409)
    return json({ error: error instanceof Error ? error.message : 'Error de sincronización' }, 500)
  }
})
