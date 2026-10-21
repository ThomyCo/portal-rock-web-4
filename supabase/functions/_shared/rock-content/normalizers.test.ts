import { canonicalizeArticleUrl } from './urls'
import { normalizeTicketmasterEvents } from './ticketmaster'
import { parseRockFeed } from './feeds'

const source = {
  id: 'source-1',
  name: 'Rock MX',
  countryCode: 'MX',
  allowedCategories: ['mexico', 'releases'] as const,
}

test('canonicalizes tracking variants into the same stable URL and hash', async () => {
  const first = await canonicalizeArticleUrl('https://rock.test/nota/?utm_source=x&id=7#top')
  const second = await canonicalizeArticleUrl('https://rock.test/nota?id=7&fbclid=abc')
  expect(first).toEqual(second)
  expect(first.url).toBe('https://rock.test/nota?id=7')
  expect(first.hash).toMatch(/^[a-f0-9]{64}$/)
})

test('maps only rock-family Ticketmaster events and preserves cancellation state', () => {
  const payload = {
    _embedded: { events: [
      {
        id: 'mx-1', name: 'Metal Night', url: 'https://tickets.test/mx-1',
        dates: { start: { dateTime: '2026-11-01T02:00:00Z' }, timezone: 'America/Mexico_City', status: { code: 'cancelled' } },
        classifications: [{ genre: { name: 'Metal' }, subGenre: { name: 'Heavy Metal' } }],
        _embedded: { venues: [{ name: 'Foro Sol', city: { name: 'Ciudad de México' }, state: { name: 'CDMX' }, country: { countryCode: 'MX' }, location: { latitude: '19.4', longitude: '-99.1' } }], attractions: [{ name: 'Metal Band' }] },
        images: [{ url: 'https://images.test/a.jpg', width: 1024 }],
      },
      { id: 'pop-1', name: 'Pop Night', url: 'https://tickets.test/pop', dates: { start: { dateTime: '2026-11-02T02:00:00Z' } }, classifications: [{ genre: { name: 'Pop' } }] },
    ] },
  }
  expect(normalizeTicketmasterEvents(payload, 'mexico', new Date('2026-10-21T00:00:00Z'))).toEqual([
    expect.objectContaining({ externalId: 'mx-1', artistName: 'Metal Band', scope: 'mexico', status: 'cancelled', city: 'Ciudad de México', latitude: 19.4, genres: ['metal', 'heavy metal'] }),
  ])
})

test('parses RSS and Atom entries, strips markup, and tolerates missing images', async () => {
  const rss = `<?xml version="1.0"?><rss><channel><item><title>Disco nuevo</title><link>https://rock.test/disco?utm_medium=rss</link><description><![CDATA[<p>Una <b>reseña</b>.</p>]]></description><pubDate>Wed, 21 Oct 2026 10:00:00 GMT</pubDate><category>lanzamientos</category></item></channel></rss>`
  const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Festival MX</title><link href="https://rock.test/festival"/><summary>Cartel mexicano</summary><updated>2026-10-21T11:00:00Z</updated></entry></feed>`

  const rssItems = await parseRockFeed(rss, source, new Date('2026-10-21T12:00:00Z'))
  const atomItems = await parseRockFeed(atom, source, new Date('2026-10-21T12:00:00Z'))
  expect(rssItems[0]).toEqual(expect.objectContaining({ title: 'Disco nuevo', summary: 'Una reseña.', category: 'releases', imageUrl: null }))
  expect(atomItems[0]).toEqual(expect.objectContaining({ title: 'Festival MX', category: 'mexico' }))
})

test('rejects insecure article links', async () => {
  const xml = `<rss><channel><item><title>Unsafe</title><link>http://rock.test/a</link><description>Text</description><pubDate>Wed, 21 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`
  await expect(parseRockFeed(xml, source, new Date())).resolves.toEqual([])
})
