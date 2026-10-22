import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '..')

test('schedules the protected content sync every six hours', () => {
  const migrationPath = path.join(root, 'supabase/migrations/202610210008_news_events_cron.sql')
  expect(fs.existsSync(migrationPath)).toBe(true)
  const sql = fs.readFileSync(migrationPath, 'utf8')
  expect(sql).toMatch(/create extension if not exists pg_cron/i)
  expect(sql).toMatch(/create extension if not exists pg_net/i)
  expect(sql).toContain("'0 */6 * * *'")
  expect(sql).toContain("/functions/v1/sync-rock-content")
  expect(sql).toContain("x-sync-secret")
  expect(sql).toContain("project_url")
  expect(sql).toContain("sync_content_secret")
})

test('documents server-only variables without leaking values', () => {
  const env = fs.readFileSync(path.join(root, '.env.example'), 'utf8')
  expect(env).toMatch(/^TICKETMASTER_API_KEY=$/m)
  expect(env).toMatch(/^SYNC_CONTENT_SECRET=$/m)
  expect(env).not.toMatch(/^VITE_(?:TICKETMASTER|SYNC_CONTENT)/m)
})
