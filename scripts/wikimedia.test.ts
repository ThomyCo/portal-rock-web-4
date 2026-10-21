import { fetchCommonsMetadata, fetchWikidataImage, fetchWikidataImages, plainText } from './wikimedia'

const response = (body: unknown, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body } as Response)

test('reads P18 and handles a missing image', async () => {
  const good = jest.fn(() => response({ entities: { Q1: { claims: { P18: [{ mainsnak: { datavalue: { value: 'Band.jpg' } } }] } } } }))
  expect(await fetchWikidataImage('Q1', good as typeof fetch)).toBe('Band.jpg')
  expect(await fetchWikidataImage('Q2', jest.fn(() => response({ entities: { Q2: { claims: {} } } })) as typeof fetch)).toBeNull()
  await expect(fetchWikidataImage('band', good as typeof fetch)).rejects.toThrow('QID')
})

test('retries a temporary Wikidata rate limit', async () => {
  const limited = { ok:false, status:429, headers:{ get:()=> '0' }, json:async()=>({}) } as unknown as Response
  const valid = { entities:{ Q9:{ claims:{ P18:[{ mainsnak:{ datavalue:{ value:'Retry.jpg' } } }] } } } }
  const fetcher = jest.fn().mockResolvedValueOnce(limited).mockImplementationOnce(() => response(valid))
  await expect(fetchWikidataImage('Q9', fetcher)).resolves.toBe('Retry.jpg')
  expect(fetcher).toHaveBeenCalledTimes(2)
})

test('loads several P18 claims in one Wikidata request', async()=>{
 const payload={entities:{Q1:{claims:{P18:[{mainsnak:{datavalue:{value:'One.jpg'}}}]}},Q2:{claims:{}}}}
 await expect(fetchWikidataImages(['Q1','Q2'],jest.fn(()=>response(payload)) as typeof fetch)).resolves.toEqual(new Map([['Q1','One.jpg'],['Q2',null]]))
})

test('normalizes complete Commons metadata and rejects incomplete media', async () => {
  const payload = { query: { pages: { 1: { imageinfo: [{ thumburl: '//upload.wikimedia.org/band.jpg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Band.jpg', extmetadata: { Artist: { value: '<b>José O\'Connor</b>' }, LicenseShortName: { value: 'CC BY-SA 4.0' } } }] } } } }
  await expect(fetchCommonsMetadata('Band.jpg', 'admin@example.com', jest.fn(() => response(payload)) as typeof fetch)).resolves.toEqual({ imageUrl: 'https://upload.wikimedia.org/band.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Band.jpg', author: "José O'Connor", license: 'CC BY-SA 4.0' })
  expect(plainText('<span>A &amp; B</span>')).toBe('A & B')
  const invalid = JSON.parse(JSON.stringify(payload)); invalid.query.pages[1].imageinfo[0].extmetadata.Artist.value = ''
  await expect(fetchCommonsMetadata('Band.jpg', 'x', jest.fn(() => response(invalid)) as typeof fetch)).rejects.toThrow('author')
})
