const TRACKING_KEYS = new Set(['fbclid', 'gclid'])

function toHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('')
}

export async function canonicalizeArticleUrl(raw: string) {
  const parsed = new URL(raw)
  if (parsed.protocol !== 'https:') throw new Error('HTTPS required')
  parsed.hash = ''
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_') || TRACKING_KEYS.has(key.toLowerCase())) {
      parsed.searchParams.delete(key)
    }
  }
  parsed.searchParams.sort()
  parsed.pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : parsed.pathname
  const url = parsed.toString()
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url))
  return { url, hash: toHex(digest) }
}
