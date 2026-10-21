import { useState, type FormEvent } from "react";
import { saveBand } from "./adminApi";
export function BandEditor() {
  const [status, setStatus] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await saveBand({
        name: String(f.get("name")),
        slug: String(f.get("slug")),
        summary: String(f.get("summary")),
        formedYear: Number(f.get("year")),
        countryCode: String(f.get("country")),
        sourceUrl: String(f.get("source")),
        latitude: Number(f.get("lat")),
        longitude: Number(f.get("lng")),
        published: f.get("published") === "on",
      });
      setStatus("Banda guardada.");
    } catch (x) {
      setStatus((x as Error).message);
    }
  }
  return (
    <section id="catalogo" className="admin-card">
      <h2>Editor de banda</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>
            Nombre
            <input name="name" required />
          </label>
          <label>
            Slug
            <input name="slug" required />
          </label>
        </div>
        <label>
          Resumen
          <textarea name="summary" required />
        </label>
        <div className="form-row">
          <label>
            Año
            <input name="year" type="number" required />
          </label>
          <label>
            País
            <input name="country" maxLength={2} required />
          </label>
        </div>
        <label>
          Fuente HTTPS
          <input name="source" type="url" required />
        </label>
        <div className="form-row">
          <label>
            Latitud
            <input name="lat" type="number" step="any" />
          </label>
          <label>
            Longitud
            <input name="lng" type="number" step="any" />
          </label>
        </div>
        <label className="checkbox">
          <input name="published" type="checkbox" /> Publicar
        </label>
        <button className="button button-primary">Guardar</button>
        <p role="status">{status}</p>
      </form>
    </section>
  );
}
