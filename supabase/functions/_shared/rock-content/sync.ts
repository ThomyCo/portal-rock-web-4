import { parseRockFeed } from './feeds.ts'
import { normalizeTicketmasterEvents } from './ticketmaster.ts'
import type { NewsCategory, NormalizedRockArticle, NormalizedRockEvent } from './types.ts'

export type SyncStatus = 'succeeded' | 'partial' | 'failed'
export type SyncSummary = {
  status: SyncStatus
  inserted: { events: number; news: number }
  updated: { events: number; news: number }
  warnings: string[]
}
export type SourceRecord = {
  id: string; name: string; feedUrl: string; countryCode: string; allowedCategories: NewsCategory[]
}
export type SyncDependencies = {
  now(): Date
  sleep(ms: number): Promise<void>
  ticketmasterKey: string
  tryStartRun(trigger: 'cron' | 'manual'): Promise<string | null>
  listSources(): Promise<SourceRecord[]>
  fetchResponse(url: string, init?: RequestInit): Promise<Response>
  upsertEvents(events: NormalizedRockEvent[]): Promise<{ inserted: number; updated: number }>
  upsertArticles(articles: NormalizedRockArticle[]): Promise<{ inserted: number; updated: number }>
  markSourceResult(sourceId: string, error: string | null): Promise<void>
  finishRun(runId: string, summary: SyncSummary): Promise<void>
}

export class SyncConflictError extends Error {
  override name = 'SyncConflictError'
}

async function fetchWithRetry<T>(deps: SyncDependencies, url: string, read: (response: Response) => Promise<T>): Promise<T> {
  let response: Response | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    try {
      response = await deps.fetchResponse(url, { signal: controller.signal })
      if (response.ok) return await read(response)
    } catch (error) {
      if (attempt === 2) throw error
      await deps.sleep(200 * 2 ** attempt)
      continue
    } finally {
      clearTimeout(timeout)
    }
    if (response.status < 500 && response.status !== 429) break
    if (attempt < 2) await deps.sleep(200 * 2 ** attempt)
  }
  throw new Error(`HTTP ${response?.status ?? 'unknown'}`)
}

export async function syncRockContent(deps: SyncDependencies, request: { triggerKind: 'cron' | 'manual' }): Promise<SyncSummary> {
  const runId = await deps.tryStartRun(request.triggerKind)
  if (!runId) throw new SyncConflictError('A content synchronization is already running')
  const summary: SyncSummary = { status: 'succeeded', inserted: { events: 0, news: 0 }, updated: { events: 0, news: 0 }, warnings: [] }
  let successes = 0
  const now = deps.now()
  const ticketmasterStart = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
  const base = 'https://app.ticketmaster.com/discovery/v2/events.json'
  const eventQueries = [
    `${base}?apikey=${encodeURIComponent(deps.ticketmasterKey)}&countryCode=MX&classificationName=rock&startDateTime=${encodeURIComponent(ticketmasterStart)}&size=100&sort=date,asc`,
    `${base}?apikey=${encodeURIComponent(deps.ticketmasterKey)}&classificationName=rock&startDateTime=${encodeURIComponent(ticketmasterStart)}&size=20&sort=date,asc`,
  ]
  for (const [index, url] of eventQueries.entries()) {
    try {
      const payload = await fetchWithRetry(deps, url, response => response.json())
      const events = normalizeTicketmasterEvents(payload, index === 0 ? 'mexico' : 'international', now)
      const counts = await deps.upsertEvents(events)
      summary.inserted.events += counts.inserted
      summary.updated.events += counts.updated
      successes++
    } catch (error) {
      summary.warnings.push(`Ticketmaster ${index === 0 ? 'México' : 'internacional'}: ${error instanceof Error ? error.message : 'error'}`)
    }
  }
  let sources: SourceRecord[] = []
  try {
    sources = await deps.listSources()
  } catch (error) {
    summary.warnings.push(`Fuentes: ${error instanceof Error ? error.message : 'error'}`)
  }
  for (const source of sources) {
    try {
      const xml = await fetchWithRetry(deps, source.feedUrl, response => response.text())
      const articles = await parseRockFeed(xml, source, now)
      const counts = await deps.upsertArticles(articles)
      summary.inserted.news += counts.inserted
      summary.updated.news += counts.updated
      await deps.markSourceResult(source.id, null)
      successes++
    } catch (error) {
      const message = error instanceof Error ? error.message : 'error'
      summary.warnings.push(`${source.name}: ${message}`)
      try { await deps.markSourceResult(source.id, message) }
      catch (markError) { summary.warnings.push(`${source.name} (registro): ${markError instanceof Error ? markError.message : 'error'}`) }
    }
  }
  summary.status = summary.warnings.length === 0 ? 'succeeded' : successes > 0 ? 'partial' : 'failed'
  await deps.finishRun(runId, summary)
  return summary
}
