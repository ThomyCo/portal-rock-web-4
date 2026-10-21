import { useAuth } from "../auth/AuthProvider";
import { BandEditor } from "./BandEditor";
import { ModerationQueue } from "./ModerationQueue";
import { NewsModerationPanel } from './NewsModerationPanel'
import { NewsSourcesPanel } from './NewsSourcesPanel'
import { EventVisibilityPanel } from './EventVisibilityPanel'
import { SyncStatusPanel } from './SyncStatusPanel'
import { useContentAdmin } from './useContentAdmin'
export function AdminLayout() {
  const { profile } = useAuth();
  const content = useContentAdmin();
  return (
    <main className="admin-page">
      <p className="eyebrow">PANEL EDITORIAL</p>
      <h1>Administración</h1>
      <div className="admin-grid">
        <aside>
          <strong>{profile?.display_name}</strong>
          <small>Rol: {profile?.role}</small>
          <a href="#moderacion">Moderación</a>
          <a href="#noticias">Noticias</a>
          {profile?.role === "admin" && <a href="#catalogo">Catálogo</a>}
          {profile?.role === "admin" && <a href="#fuentes">Fuentes</a>}
          {profile?.role === "admin" && <a href="#eventos">Eventos</a>}
          {profile?.role === "admin" && <a href="#sincronizacion">Sincronización</a>}
        </aside>
        <div>
          {profile?.role === "admin" && <BandEditor />}
          <ModerationQueue />
          <NewsModerationPanel manager={content}/>
          {profile?.role === 'admin' && <><NewsSourcesPanel manager={content}/><EventVisibilityPanel manager={content}/><SyncStatusPanel manager={content}/></>}
        </div>
      </div>
    </main>
  );
}
