import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getBand } from "./api";
import { FavoriteButton } from "./FavoriteButton";
import { BandHeroImage } from "./BandHeroImage";
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
          <p className="eyebrow">{data.city}, {data.countryCode} · {data.formationYear}{data.endedYear ? `–${data.endedYear}` : '–ACTUALIDAD'}</p>
          <h1>{data.name}</h1>
          <p>{data.summary}</p>
          <FavoriteButton bandId={data.id} />
        </div>
        <BandHeroImage {...data}/>
      </section>
      <section className="band-story">
        <div>
          <p className="eyebrow">LA HISTORIA</p>
          <h2>Una ciudad, un sonido.</h2>
        </div>
        <div>
          {data.biography.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <p>
            <strong>Géneros:</strong> {data.genres.join(", ")}
          </p>
        </div>
      </section>
    </main>
  );
}
