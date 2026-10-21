import { syncRockContent, type SyncDependencies } from './sync'

function response(body: string, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => JSON.parse(body), text: async () => body } as Response
}

function deps(overrides: Partial<SyncDependencies> = {}): SyncDependencies {
  return {
    now: () => new Date('2026-10-21T12:00:00Z'),
    sleep: async () => {},
    ticketmasterKey: 'key',
    tryStartRun: async () => 'run-1',
    listSources: async () => [{ id: 's1', name: 'Feed', feedUrl: 'https://feed.test/rss', countryCode: 'MX', allowedCategories: ['mexico'] }],
    fetchResponse: async url => {
      if (url.includes('ticketmaster')) return response(JSON.stringify({ _embedded: { events: [] } }))
      return response('<rss><channel></channel></rss>')
    },
    upsertEvents: async () => ({ inserted: 0, updated: 0 }),
    upsertArticles: async () => ({ inserted: 0, updated: 0 }),
    markSourceResult: async () => {},
    finishRun: async () => {},
    ...overrides,
  }
}

test('queries Mexico first and then a limited international rock selection', async () => {
  const urls: string[] = []
  const input = deps({ fetchResponse: async url => { urls.push(url); return response(JSON.stringify({ _embedded: { events: [] } })) } })
  await syncRockContent(input, { triggerKind: 'cron' })
  expect(urls[0]).toContain('countryCode=MX')
  expect(urls[0]).toContain('classificationName=rock')
  expect(urls[1]).toContain('size=20')
  expect(urls[1]).not.toContain('countryCode=MX')
})

test('keeps successful providers when one feed fails and records a partial run', async () => {
  const finished: any[] = []
  const sourceResults: any[] = []
  const input = deps({
    listSources: async () => [
      { id: 'bad', name: 'Bad', feedUrl: 'https://bad.test/rss', countryCode: 'MX', allowedCategories: ['mexico'] },
      { id: 'good', name: 'Good', feedUrl: 'https://good.test/rss', countryCode: 'MX', allowedCategories: ['mexico'] },
    ],
    fetchResponse: async url => {
      if (url.includes('ticketmaster')) return response(JSON.stringify({ _embedded: { events: [] } }))
      if (url.includes('bad.test')) return response('down', 503)
      return response('<rss><channel></channel></rss>')
    },
    markSourceResult: async (...args) => { sourceResults.push(args) },
    finishRun: async (...args) => { finished.push(args) },
  })
  const result = await syncRockContent(input, { triggerKind: 'cron' })
  expect(result.status).toBe('partial')
  expect(result.warnings[0]).toContain('Bad')
  expect(sourceResults).toContainEqual(['good', null])
  expect(finished[0][1]).toEqual(expect.objectContaining({ status: 'partial' }))
})

test('retries temporary failures twice but never retries a client error', async () => {
  let temporary = 0
  let client = 0
  const input = deps({
    listSources: async () => [
      { id: 'temp', name: 'Temp', feedUrl: 'https://temp.test/rss', countryCode: 'MX', allowedCategories: ['mexico'] },
      { id: 'client', name: 'Client', feedUrl: 'https://client.test/rss', countryCode: 'MX', allowedCategories: ['mexico'] },
    ],
    fetchResponse: async url => {
      if (url.includes('ticketmaster')) return response(JSON.stringify({ _embedded: { events: [] } }))
      if (url.includes('temp.test')) { temporary++; return response('later', 503) }
      client++; return response('bad', 400)
    },
  })
  await syncRockContent(input, { triggerKind: 'manual' })
  expect(temporary).toBe(3)
  expect(client).toBe(1)
})

test('returns conflict before calling providers when another run is active', async () => {
  let fetched = false
  await expect(syncRockContent(deps({ tryStartRun: async () => null, fetchResponse: async () => { fetched = true; return response('') } }), { triggerKind: 'manual' }))
    .rejects.toMatchObject({ name: 'SyncConflictError' })
  expect(fetched).toBe(false)
})
