import fs from 'node:fs'
import path from 'node:path'

const migration = path.resolve(
  __dirname,
  '../supabase/migrations/202610210007_news_events.sql',
)

describe('rock news and events database contract', () => {
  test('installs the four content tables and their idempotency constraints', () => {
    expect(fs.existsSync(migration)).toBe(true)
    const sql = fs.readFileSync(migration, 'utf8')

    for (const table of ['rock_events', 'rock_news', 'rock_news_sources', 'content_sync_runs']) {
      expect(sql).toMatch(new RegExp(`create table public\\.${table}`, 'i'))
    }
    expect(sql).toMatch(/unique\s*\(provider,\s*external_id\)/i)
    expect(sql).toMatch(/url_hash\s+text\s+not null\s+unique/i)
    expect(sql).toMatch(/where\s*\(featured\s+and\s+status\s*=\s*'approved'\)/i)
    expect(sql).toMatch(/where\s*\(status\s*=\s*'running'\)/i)
  })

  test('publishes filtered security-invoker projections', () => {
    const sql = fs.readFileSync(migration, 'utf8')

    expect(sql).toMatch(/public_rock_events[\s\S]+security_invoker\s*=\s*true/i)
    expect(sql).toMatch(/starts_at\s*>=\s*now\(\)[\s\S]+not\s+hidden/i)
    expect(sql).toMatch(/public_rock_news[\s\S]+security_invoker\s*=\s*true/i)
    expect(sql).toMatch(/status\s*=\s*'approved'/i)
  })

  test('defines atomic editorial functions and explicit grants', () => {
    const sql = fs.readFileSync(migration, 'utf8')

    for (const routine of [
      'moderate_rock_news',
      'set_featured_rock_news',
      'reorder_rock_news',
      'set_rock_event_hidden',
      'set_rock_news_source',
    ]) {
      expect(sql).toMatch(new RegExp(`function public\\.${routine}`, 'i'))
    }
    expect(sql).toMatch(/grant select on public\.public_rock_events, public\.public_rock_news to anon, authenticated/i)
    expect(sql).toMatch(/revoke all on public\.rock_news_sources from anon, authenticated/i)
  })
})
