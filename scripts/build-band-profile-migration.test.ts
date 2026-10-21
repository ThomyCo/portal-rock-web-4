import { buildBandProfileMigration, sqlLiteral } from './build-band-profile-migration'

test('escapes SQL and builds deterministic updates with warnings', async () => {
  expect(sqlLiteral("Guns N' Roses")).toBe("'Guns N'' Roses'")
  const manifest = [
    { slug:'zeta', wikidataId:'Q2', summary:'Dos', biography:['Uno largo','Dos largo'], imageAlt:'Zeta en vivo', endedYear:null },
    { slug:'alpha', wikidataId:'Q1', summary:'Mötley Crüe', biography:['Primero','Segundo'], imageAlt:'Alpha en vivo', endedYear:2000 }
  ]
  const fetchImage = jest.fn(async (qid:string) => qid === 'Q1' ? 'Alpha.jpg' : null)
  const fetchMedia = jest.fn(async () => ({ imageUrl:'https://upload.wikimedia.org/a.jpg', sourceUrl:'https://commons.wikimedia.org/a', author:"O'Neil", license:'CC BY 4.0' }))
  const result = await buildBandProfileMigration({ manifest, contact:'x', fetchImage, fetchMedia })
  expect(result.sql.indexOf("slug = 'alpha'")).toBeLessThan(result.sql.indexOf("slug = 'zeta'"))
  expect(result.sql).toContain("O''Neil")
  expect(result.sql).toContain('Primero\\n\\nSegundo')
  expect(result.warnings).toHaveLength(1)
})
