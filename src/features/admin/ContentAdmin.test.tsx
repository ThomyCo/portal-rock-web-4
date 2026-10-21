import { render, screen } from '@testing-library/react'
import { AdminLayout } from './AdminLayout'
import { useAuth } from '../auth/AuthProvider'
import { useContentAdmin } from './useContentAdmin'

jest.mock('../auth/AuthProvider',()=>({useAuth:jest.fn()}))
jest.mock('./useContentAdmin',()=>({useContentAdmin:jest.fn()}))
const auth=useAuth as jest.MockedFunction<typeof useAuth>
const content=useContentAdmin as jest.MockedFunction<typeof useContentAdmin>

beforeEach(()=>{
  content.mockReturnValue({
    pending:{data:[],isLoading:false},approved:{data:[],isLoading:false},events:{data:[],isLoading:false},sources:{data:[],isLoading:false},runs:{data:[],isLoading:false},
    moderate:{mutate:jest.fn(),isPending:false},feature:{mutate:jest.fn(),isPending:false},reorder:{mutate:jest.fn(),isPending:false},hideEvent:{mutate:jest.fn(),isPending:false},saveSource:{mutate:jest.fn(),isPending:false},sync:{mutate:jest.fn(),isPending:false},
  } as unknown as ReturnType<typeof useContentAdmin>)
})

test('moderators receive the news queue without admin-only controls',()=>{
  auth.mockReturnValue({profile:{display_name:'Mara',role:'moderator'}} as ReturnType<typeof useAuth>)
  render(<AdminLayout/>)
  expect(screen.getByRole('heading',{name:'Noticias pendientes'})).toBeInTheDocument()
  expect(screen.queryByRole('heading',{name:'Fuentes RSS'})).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/sincronizar ahora/i})).not.toBeInTheDocument()
})

test('administrators receive sources, events, and synchronization diagnostics',()=>{
  auth.mockReturnValue({profile:{display_name:'Ana',role:'admin'}} as ReturnType<typeof useAuth>)
  render(<AdminLayout/>)
  expect(screen.getByRole('heading',{name:'Fuentes RSS'})).toBeInTheDocument()
  expect(screen.getByRole('heading',{name:'Eventos importados'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:/sincronizar ahora/i})).toBeInTheDocument()
  expect(screen.getByRole('heading',{name:'Historial de sincronización'})).toBeInTheDocument()
})
