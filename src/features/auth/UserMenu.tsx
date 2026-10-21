import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function UserMenu() {
  const { user, profile, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [open])

  if (loading) return <span className="nav-user-loading" aria-label="Comprobando sesión" />
  if (!user) return <Link className="nav-login" to="/acceso">Ingresar</Link>

  const label = profile?.display_name || user.email || 'Mi cuenta'
  const initial = label.trim().charAt(0).toLocaleUpperCase() || 'U'
  const canManage = profile?.role === 'admin' || profile?.role === 'moderator'

  async function logout() {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="user-menu" ref={root}>
      <button
        className="user-menu__trigger"
        type="button"
        aria-label="Abrir menú de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" /></svg>
        <span aria-hidden="true">{initial}</span>
      </button>
      {open && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__identity">
            <strong>{profile?.display_name || 'Mi cuenta'}</strong>
            {profile?.username && <span>@{profile.username}</span>}
            <small>{user.email}</small>
          </div>
          <Link role="menuitem" to="/perfil" onClick={() => setOpen(false)}>Mi perfil</Link>
          {canManage && <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>Panel de administración</Link>}
          <button role="menuitem" type="button" onClick={() => void logout()}>Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}
