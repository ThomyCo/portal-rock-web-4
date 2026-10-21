import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './app.css'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { RecoverPage } from '../features/auth/RecoverPage'
import { ProfilePage } from '../features/auth/ProfilePage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { BandPage } from '../features/bands/BandPage'
import { CommunityPage } from '../features/community/CommunityPage'
import { RequireRole } from '../features/auth/RequireRole'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { SkipLink } from '../components/SkipLink'
import { UserMenu } from '../features/auth/UserMenu'
import { HomePage } from '../features/home/HomePage'

const MapPage = lazy(() => import('../features/map/MapPage').then(module => ({ default: module.MapPage })))
const AdminLayout = lazy(() => import('../features/admin/AdminLayout').then(module => ({ default: module.AdminLayout })))

function Placeholder({ title, description }: { title: string; description: string }) {
  return <main className="page"><p className="eyebrow">PORTAL ROCK</p><h1>{title}</h1><p>{description}</p></main>
}

export function App() {
  return (
    <div className="app-shell">
      <SkipLink />
      <ConnectionStatus />
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Portal Rock, inicio"><span aria-hidden="true">◉</span> PORTAL ROCK</Link>
        <nav aria-label="Navegación principal">
          <Link to="/mapa">Explorar mapa</Link>
          <Link to="/bandas">Bandas</Link>
          <Link to="/comunidad">Comunidad</Link>
          <UserMenu />
        </nav>
      </header>
      <div id="contenido" tabIndex={-1} className="route-content"><Suspense fallback={<main className="page"><p role="status">Cargando sección…</p></main>}><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/bandas" element={<Placeholder title="Bandas" description="Perfiles, géneros y conexiones musicales." />} />
        <Route path="/bandas/:slug" element={<BandPage />} />
        <Route path="/comunidad" element={<CommunityPage />} />
        <Route path="/acceso" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<RecoverPage />} />
        <Route path="/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><RequireRole roles={['moderator','admin']}><AdminLayout /></RequireRole></RequireAuth>} />
      </Routes></Suspense></div>
      <footer><span>Portal Rock © 2026</span><span>Datos abiertos · Comunidad global</span></footer>
    </div>
  )
}
