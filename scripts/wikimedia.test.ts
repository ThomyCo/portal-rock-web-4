import { fetchCommonsMetadata, fetchWikidataImage, plainText } from './wikimedia'

const response = (body: unknown, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body } as Response)

test('reads P18 and handles a missing image', async () => {
  const good = jest.fn(() => response({ entities: { Q1: { claims: { P18: [{ mainsnak: { datavalue: { value: 'Band.jpg' } } }] } } } }))
  expect(await fetchWikidataImage('Q1', good as typeof fetch)).toBe('Band.jpg')
  expect(await fetchWikidataImage('Q2', jest.fn(() => response({ entities: { Q2: { claims: {} } } })) as typeof fetch)).toBeNull()
  await expect(fetchWikidataImage('band', good as typeof fetch)).rejects.toThrow('QID')
})

test('normalizes complete Commons metadata and rejects incomplete media', async () => {
  const payload = { query: { pages: { 1: { imageinfo: [{ thumburl: '//upload.wikimedia.org/band.jpg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Band.jpg', extmetadata: { Artist: { value: '<b>José O\'Connor</b>' }, LicenseShortName: { value: 'CC BY-SA 4.0' } } }] } } } }
  await expect(fetchCommonsMetadata('Band.jpg', 'admin@example.com', jest.fn(() => response(payload)) as typeof fetch)).resolves.toEqual({ imageUrl: 'https://upload.wikimedia.org/band.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Band.jpg', author: "José O'Connor", license: 'CC BY-SA 4.0' })
  expect(plainText('<span>A &amp; B</span>')).toBe('A & B')
  const invalid = JSON.parse(JSON.stringify(payload)); invalid.query.pages[1].imageinfo[0].extmetadata.Artist.value = ''
  await expect(fetchCommonsMetadata('Band.jpg', 'x', jest.fn(() => response(invalid)) as typeof fetch)).rejects.toThrow('author')
})
