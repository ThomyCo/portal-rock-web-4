import type { NewsCategory, NormalizedRockArticle, RockNewsSourceInput } from './types.ts'
import { canonicalizeArticleUrl } from './urls.ts'

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim()
}

function element(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
    if (match) return decode(match[1])
  }
  return ''
}

function link(block: string) {
  const href = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1]
  return decode(href || element(block, ['link', 'guid']))
}

function image(block: string) {
  const match = block.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*\burl=["']([^"']+)["']/i)
  return match?.[1]?.startsWith('https://') ? match[1] : null
}

function categoryFor(block: string, source: RockNewsSourceInput): NewsCategory {
  const label = element(block, ['category']).toLowerCase()
  const desired: NewsCategory = /lanz|estreno|disco|album|álbum/.test(label)
    ? 'releases'
    : /festival/.test(label) ? 'festivals'
      : source.countryCode.toUpperCase() === 'MX' ? 'mexico' : 'international'
  return source.allowedCategories.includes(desired) ? desired : source.allowedCategories[0] || 'other'
}

export async function parseRockFeed(xml: string, source: RockNewsSourceInput, fetchedAt: Date): Promise<NormalizedRockArticle[]> {
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(match => match[2])
  const results: NormalizedRockArticle[] = []
  const seenHashes = new Set<string>()
  for (const block of blocks) {
    const title = element(block, ['title'])
    const rawUrl = link(block)
    const date = element(block, ['pubDate', 'published', 'updated'])
    if (!title || !rawUrl || !date || Number.isNaN(Date.parse(date))) continue
    try {
      const canonical = await canonicalizeArticleUrl(rawUrl)
      if (seenHashes.has(canonical.hash)) continue
      seenHashes.add(canonical.hash)
      results.push({
        sourceId: source.id,
        canonicalUrl: canonical.url,
        urlHash: canonical.hash,
        title,
        summary: element(block, ['description', 'summary', 'content']),
        imageUrl: image(block),
        publishedAt: new Date(date).toISOString(),
        fetchedAt: fetchedAt.toISOString(),
        category: categoryFor(block, source),
      })
    } catch { /* invalid or insecure URL */ }
  }
  return results
}
