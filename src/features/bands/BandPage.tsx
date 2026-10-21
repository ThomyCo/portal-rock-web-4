import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getBand } from "./api";
import { FavoriteButton } from "./FavoriteButton";
export function BandPage() {
  const { slug = "" } = useParams(),
    { data, error, isPending } = useQuery({
      queryKey: ["band", slug],
      queryFn: () => getBand(slug),
    });
  if (isPending)
    return (
      <main className="page">
        <p role="status">Cargando historia…</p>
      </main>
    );
  if (error || !data)
    return (
      <main className="page">
        <h1>Banda no encontrada</h1>
        <Link to="/mapa">Volver al mapa</Link>
      </main>
    );
  return (
    <main className="band-page">
      <section className="band-hero">
        <div>
          <p className="eyebrow">
            {data.countryCode} · DESDE {data.formationYear}
          </p>
          <h1>{data.name}</h1>
          <p>{data.summary}</p>
          <FavoriteButton bandId={data.id} />
        </div>
        <div
          className="cover-fallback"
          aria-label={`Imagen gráfica de ${data.name}`}
        >
          <span>{data.name.slice(0, 2).toUpperCase()}</span>
        </div>
      </section>
      <section className="band-story">
        <div>
          <p className="eyebrow">LA HISTORIA</p>
          <h2>Una ciudad, un sonido.</h2>
        </div>
        <div>
          <p>{data.biography}</p>
          <p>
            <strong>Géneros:</strong> {data.genres.join(", ")}
          </p>
          <a href={data.sourceUrl} target="_blank" rel="noreferrer">
            Consultar fuente abierta ↗
          </a>
        </div>
      </section>
    </main>
  );
}
