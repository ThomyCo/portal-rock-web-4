import fs from 'node:fs'
import path from 'node:path'
import { demoBands } from '../src/features/bands/demoCatalog'

type Entry = {
  slug: string
  wikidataId: string
  summary: string
  biography: string[]
  imageAlt: string
  endedYear: number | null
}

describe('reviewed Spanish band content', () => {
  test('covers the exact 54-band catalog with complete editorial fields', () => {
    const file = path.resolve(__dirname, '../content/bands.es.json')
    expect(fs.existsSync(file)).toBe(true)
    const entries = JSON.parse(fs.readFileSync(file, 'utf8')) as Entry[]
    expect(entries).toHaveLength(54)
    expect(entries.map(({ slug }) => slug).sort()).toEqual(demoBands.map(({ slug }) => slug).sort())
    expect(new Set(entries.map(({ slug }) => slug)).size).toBe(54)
    expect(new Set(entries.map(({ wikidataId }) => wikidataId)).size).toBe(54)

    for (const entry of entries) {
      const band = demoBands.find(({ slug }) => slug === entry.slug)!
      expect(entry.wikidataId).toMatch(/^Q[1-9][0-9]*$/)
      expect(entry.summary.trim().length).toBeGreaterThan(30)
      expect(entry.biography.length).toBeGreaterThanOrEqual(2)
      expect(entry.biography.length).toBeLessThanOrEqual(4)
      entry.biography.forEach((paragraph) => expect(paragraph.trim().length).toBeGreaterThan(60))
      expect(entry.imageAlt).toMatch(new RegExp(band.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
      expect(entry.imageAlt.trim().length).toBeGreaterThan(band.name.length + 10)
      expect(entry.endedYear === null || entry.endedYear >= band.formationYear).toBe(true)
    }
  })
})
