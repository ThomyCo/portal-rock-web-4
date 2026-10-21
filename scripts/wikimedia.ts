export type CommonsMedia = { imageUrl: string; sourceUrl: string; author: string; license: string }

export function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
}

export async function fetchWikidataImage(qid: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  if (!/^Q[1-9]\d*$/.test(qid)) throw new Error('QID inválido')
  const url = new URL('https://www.wikidata.org/w/api.php')
  url.search = new URLSearchParams({ action: 'wbgetentities', format: 'json', props: 'claims', ids: qid }).toString()
  const response = await fetcher(url)
  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`)
  return (await response.json()).entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null
}

export async function fetchCommonsMetadata(fileTitle: string, contact: string, fetcher: typeof fetch = fetch): Promise<CommonsMedia> {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.search = new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1600', iiextmetadatafilter: 'Artist|LicenseShortName|UsageTerms', titles: `File:${fileTitle.replace(/^File:/, '')}` }).toString()
  const response = await fetcher(url, { headers: { 'User-Agent': `PortalRockWeb4/1.0 (contacto: ${contact})` } })
  if (!response.ok) throw new Error(`Commons HTTP ${response.status}`)
  const page = Object.values((await response.json()).query?.pages ?? {})[0] as any
  const info = page?.imageinfo?.[0]
  const normalizeUrl = (value?: string) => value?.startsWith('//') ? `https:${value}` : value
  const imageUrl = normalizeUrl(info?.thumburl ?? info?.url)
  const sourceUrl = normalizeUrl(info?.descriptionurl)
  const author = plainText(info?.extmetadata?.Artist?.value ?? '')
  const license = plainText(info?.extmetadata?.LicenseShortName?.value ?? info?.extmetadata?.UsageTerms?.value ?? '')
  if (!imageUrl?.startsWith('https://')) throw new Error('imageUrl debe usar HTTPS')
  if (!sourceUrl?.startsWith('https://')) throw new Error('sourceUrl debe usar HTTPS')
  if (!author) throw new Error('author ausente')
  if (!license) throw new Error('license ausente')
  return { imageUrl, sourceUrl, author, license }
}
