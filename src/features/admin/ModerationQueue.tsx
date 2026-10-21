export function ModerationQueue() {
  return (
    <section id="moderacion" className="admin-card">
      <h2>Cola de moderación</h2>
      <div className="empty">
        <p>No hay reportes pendientes.</p>
        <small>Los nuevos reportes aparecerán aquí en tiempo real.</small>
      </div>
    </section>
  );
}
