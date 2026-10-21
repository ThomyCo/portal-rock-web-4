import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
export function RequireAuth({children}:{children:ReactNode}){const {user,loading}=useAuth(),location=useLocation();if(loading)return <p role="status">Comprobando sesión…</p>;return user?children:<Navigate to={`/acceso?next=${encodeURIComponent(location.pathname+location.search)}`} replace/>}
