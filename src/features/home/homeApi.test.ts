import { buildHomeContent, normalizeArtistName } from './homeApi'

const news = [
  { id:'n2',title:'Dos',summary:'B',canonical_url:'https://news.test/2',image_url:null,published_at:'2026-10-20T00:00:00Z',category:'international',featured:false,editorial_order:2,source_name:'Fuente' },
  { id:'n1',title:'Uno',summary:'A',canonical_url:'https://news.test/1',image_url:'https://img.test/1.jpg',published_at:'2026-10-21T00:00:00Z',category:'mexico',featured:true,editorial_order:1,source_name:'Fuente' },
]
const events = [
  { id:'e2',name:'Show US',artist_name:'Other',starts_at:'2026-12-02T00:00:00Z',venue_name:'Hall',city:'Austin',state:'TX',country_code:'US',image_url:null,ticket_url:'https://tickets.test/2',scope:'international',status:'scheduled',genres:['rock'] },
  { id:'e1',name:'Show MX',artist_name:'Mötley Crüe',starts_at:'2026-11-01T00:00:00Z',venue_name:'Arena',city:'Ciudad de México',state:'CDMX',country_code:'MX',image_url:null,ticket_url:'https://tickets.test/1',scope:'mexico',status:'scheduled',genres:['metal'] },
]

test('builds Mexico-first homepage content with featured editorial order', () => {
  const result = buildHomeContent(news, events, [{ name:'Motley Crue', slug:'motley-crue' }])
  expect(result.news.map(item => item.id)).toEqual(['n1','n2'])
  expect(result.mexicoEvents.map(item => item.id)).toEqual(['e1'])
  expect(result.internationalEvents.map(item => item.id)).toEqual(['e2'])
  expect(result.mexicoEvents[0].bandSlug).toBe('motley-crue')
})

test('artist matching ignores accents, punctuation and case', () => {
  expect(normalizeArtistName('  MÖTLEY CRÜE! ')).toBe('motley crue')
})

test('does not invent a band link without an exact normalized match', () => {
  const result = buildHomeContent(news, events, [{ name:'Other Band', slug:'other-band' }])
  expect(result.mexicoEvents[0].bandSlug).toBeNull()
})
