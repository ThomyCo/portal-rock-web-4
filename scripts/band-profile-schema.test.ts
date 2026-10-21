import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '..')

describe('band profile database contract', () => {
  test('migration adds licensed media fields, HTTPS checks and public DTO columns', () => {
    const migrationPath = path.join(root, 'supabase/migrations/202610210004_band_profile_media.sql')
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    for (const column of ['image_source_url', 'image_author', 'image_license', 'image_alt']) {
      expect(sql).toMatch(new RegExp(`add column if not exists ${column} text`, 'i'))
    }
    expect(sql).toMatch(new RegExp('image_url[^;]+https://', 'is'))
    expect(sql).toMatch(new RegExp('image_source_url[^;]+https://', 'is'))
    for (const dtoField of ['endedYear', 'imageSourceUrl', 'imageAuthor', 'imageLicense', 'imageAlt']) {
      expect(sql).toContain(`"${dtoField}"`)
    }
  })

  test('frontend detail type exposes nullable profile metadata', () => {
    const source = fs.readFileSync(path.join(root, 'src/features/bands/types.ts'), 'utf8')
    expect(source).toMatch(/endedYear:\s*number\s*\|\s*null/)
    expect(source).toMatch(/imageSourceUrl:\s*string\s*\|\s*null/)
    expect(source).toMatch(/imageAuthor:\s*string\s*\|\s*null/)
    expect(source).toMatch(/imageLicense:\s*string\s*\|\s*null/)
    expect(source).toMatch(/imageAlt:\s*string\s*\|\s*null/)
  })

  test('offline demo records provide safe null profile defaults', () => {
    const source = fs.readFileSync(path.join(root, 'src/features/bands/demoCatalog.ts'), 'utf8')
    for (const field of ['endedYear', 'imageSourceUrl', 'imageAuthor', 'imageLicense', 'imageAlt']) {
      expect(source).toContain(`${field}:null`)
    }
  })
})
