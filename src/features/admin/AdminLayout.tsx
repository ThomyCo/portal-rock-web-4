import { useAuth } from "../auth/AuthProvider";
import { BandEditor } from "./BandEditor";
import { ModerationQueue } from "./ModerationQueue";
export function AdminLayout() {
  const { profile } = useAuth();
  return (
    <main className="admin-page">
      <p className="eyebrow">PANEL EDITORIAL</p>
      <h1>Administración</h1>
      <div className="admin-grid">
        <aside>
          <strong>{profile?.display_name}</strong>
          <small>Rol: {profile?.role}</small>
          <a href="#moderacion">Moderación</a>
          {profile?.role === "admin" && <a href="#catalogo">Catálogo</a>}
        </aside>
        <div>
          {profile?.role === "admin" && <BandEditor />}
          <ModerationQueue />
        </div>
      </div>
    </main>
  );
}
