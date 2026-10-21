import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

it('schema-qualifies every PostGIS type and function', () => {
  const files = [...globSync('supabase/migrations/*.sql'), 'supabase/seed.sql']
  const sql = files.map(file => readFileSync(file, 'utf8')).join('\n')

  expect(sql).not.toMatch(/(?<!extensions\.)::(?:geometry|geography)\b/i)
  expect(sql).not.toMatch(/(?<!extensions\.)\bst_(?:x|y|setsrid|makepoint)\b/i)
})
