import { Link } from "react-router-dom";
import type { BandSummary } from "../bands/types";
export function AccessibleBandList({
  bands,
  selectedId,
  onSelect,
}: {
  bands: BandSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="band-list" aria-label="Bandas encontradas">
      {bands.map((b) => (
        <article className={selectedId === b.id ? "selected" : ""} key={b.id}>
          <button onClick={() => onSelect(b.id)}>
            <span className="marker-dot" />
            <span>
              <strong>{b.name}</strong>
              <small>
                {b.formationYear} · {b.countryCode} · {b.genres.join(" / ")}
              </small>
            </span>
          </button>
          <Link to={`/bandas/${b.slug}`}>Ver historia</Link>
        </article>
      ))}
    </div>
  );
}
