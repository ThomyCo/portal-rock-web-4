import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from './HomePage'
import { cityGroupFor } from './MexicoEvents'
import { useHomeContent } from './useHomeContent'

jest.mock('./useHomeContent',()=>({useHomeContent:jest.fn()}))
const mocked = useHomeContent as jest.MockedFunction<typeof useHomeContent>
const content = {
  news:[
    {id:'n1',title:'Rock mexicano hoy',summary:'Historia principal.',url:'https://news.test/1',imageUrl:null,publishedAt:'2026-10-21T00:00:00Z',category:'mexico' as const,featured:true,editorialOrder:1,sourceName:'Rock MX'},
    {id:'n2',title:'Gira internacional',summary:'Mundo.',url:'https://news.test/2',imageUrl:null,publishedAt:'2026-10-20T00:00:00Z',category:'international' as const,featured:false,editorialOrder:2,sourceName:'NME'},
    {id:'n3',title:'Nuevo disco',summary:'Estreno.',url:'https://news.test/3',imageUrl:null,publishedAt:'2026-10-19T00:00:00Z',category:'releases' as const,featured:false,editorialOrder:3,sourceName:'Rock MX'},
  ],
  mexicoEvents:[{id:'e1',name:'Metal MX',artistName:'Metallica',startsAt:'2026-11-01T02:00:00Z',venueName:'Foro',city:'Ciudad de México',state:'CDMX',countryCode:'MX',imageUrl:null,ticketUrl:'https://tickets.test/1',scope:'mexico' as const,status:'cancelled' as const,genres:['metal'],bandSlug:'metallica'}],
  internationalEvents:[{id:'e2',name:'Rock World',artistName:'Muse',startsAt:'2026-12-01T02:00:00Z',venueName:'Arena',city:'London',state:null,countryCode:'GB',imageUrl:null,ticketUrl:'https://tickets.test/2',scope:'international' as const,status:'scheduled' as const,genres:['rock'],bandSlug:'muse'}],
}

beforeEach(()=>mocked.mockReturnValue({data:content,isLoading:false,error:null} as ReturnType<typeof useHomeContent>))

test('groups the main Mexican concert cities and keeps the rest together',()=>{
  expect(cityGroupFor('Ciudad de México')).toBe('cdmx')
  expect(cityGroupFor('Monterrey')).toBe('monterrey')
  expect(cityGroupFor('Guadalajara')).toBe('guadalajara')
  expect(cityGroupFor('Puebla')).toBe('otras')
})

test('renders the featured story, Mexico first, and portal connections',()=>{
  render(<MemoryRouter><HomePage/></MemoryRouter>)
  expect(screen.getByRole('heading',{name:'Rock mexicano hoy'})).toBeInTheDocument()
  const mexico=screen.getByRole('heading',{name:'Conciertos en México'})
  const world=screen.getByRole('heading',{name:'Selección internacional'})
  expect(mexico.compareDocumentPosition(world)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.getByRole('link',{name:/perfil de Metallica/i})).toHaveAttribute('href','/bandas/metallica')
  expect(screen.getByRole('link',{name:/explorar mapa/i})).toBeInTheDocument()
  expect(screen.getByRole('link',{name:/comunidad/i})).toBeInTheDocument()
})

test('switches quick-news tabs with keyboard navigation',()=>{
  render(<MemoryRouter><HomePage/></MemoryRouter>)
  const mexico=screen.getByRole('tab',{name:'México'})
  mexico.focus();fireEvent.keyDown(mexico,{key:'ArrowRight'})
  expect(screen.getByRole('tab',{name:'Internacional'})).toHaveAttribute('aria-selected','true')
  expect(within(screen.getByRole('tabpanel')).getByText('Gira internacional')).toBeInTheDocument()
})

test('marks cancelled events and removes the ticket call to action',()=>{
  render(<MemoryRouter><HomePage/></MemoryRouter>)
  expect(screen.getByText('Cancelado')).toBeInTheDocument()
  expect(screen.queryByRole('link',{name:/boletos para Metal MX/i})).not.toBeInTheDocument()
})

test('shows useful empty states without hiding portal links',()=>{
  mocked.mockReturnValue({data:{news:[],mexicoEvents:[],internationalEvents:[]},isLoading:false,error:null} as unknown as ReturnType<typeof useHomeContent>)
  render(<MemoryRouter><HomePage/></MemoryRouter>)
  expect(screen.getByText(/preparamos la próxima edición/i)).toBeInTheDocument()
  expect(screen.getByText(/no hay conciertos próximos/i)).toBeInTheDocument()
  expect(screen.getByRole('link',{name:/explorar mapa/i})).toBeInTheDocument()
})
