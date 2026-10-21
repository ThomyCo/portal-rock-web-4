import { filterDemoBands } from './api'
import { demoBands } from './demoCatalog'

it('combines genre, decade, country and query filters', () => {
  expect(filterDemoBands({ genre:'rock-en-espanol', decade:1980, country:'MX', query:'identidad' }).map(b => b.slug)).toEqual(['caifanes'])
})

it('returns an empty array for a combination without matches', () => {
  expect(filterDemoBands({ genre:'thrash-metal', country:'GB' })).toEqual([])
})

it('includes the requested international bands with their origin cities', () => {
  const requested = [
    'The Beatles', 'Queen', 'The Rolling Stones', 'Pink Floyd', 'Led Zeppelin',
    'Metallica', 'U2', 'AC/DC', "Guns N' Roses", 'Nirvana', 'Coldplay',
    'Linkin Park', 'Red Hot Chili Peppers', 'Bon Jovi', 'Aerosmith', 'The Who',
    'Radiohead', 'Green Day', 'Foo Fighters', 'Iron Maiden', 'Black Sabbath',
    'Deep Purple', 'Kiss', 'Journey', 'Pearl Jam', 'The Eagles', 'Fleetwood Mac',
    'Oasis', 'R.E.M.', 'Imagine Dragons', 'Maroon 5', 'Arctic Monkeys', 'Muse',
    'The Cure', 'Depeche Mode', 'Blur', 'ABBA', 'Bee Gees', 'Scorpions',
    'Evanescence', 'System of a Down', 'Twenty One Pilots', 'Paramore',
    'Mötley Crüe', 'The Doors', 'Creedence Clearwater Revival', 'Van Halen',
    'Def Leppard', 'The Police', 'Genesis',
  ]

  expect(requested.every(name => demoBands.some(band => band.name === name))).toBe(true)
  expect(demoBands.filter(band => requested.includes(band.name)).every(band => band.city.length > 0)).toBe(true)
})

it('finds demo bands by city', () => {
  expect(filterDemoBands({ query: 'Liverpool' }).map(band => band.name)).toContain('The Beatles')
})
