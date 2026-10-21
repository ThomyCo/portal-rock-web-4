import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
export function RequireRole({roles,children}:{roles:Array<'moderator'|'admin'>;children:ReactNode}){const {profile}=useAuth();return profile&&roles.includes(profile.role as 'moderator'|'admin')?children:<Navigate to="/" replace/>}
