import type { BandFilters } from "../bands/types";
export function MapFilters({
  value,
  onChange,
  onReset,
}: {
  value: BandFilters;
  onChange: (x: BandFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="map-filters">
      <label>
        Buscar
        <input
          value={value.query ?? ""}
          placeholder="Banda o ciudad"
          onChange={(e) =>
            onChange({ ...value, query: e.target.value || undefined })
          }
        />
      </label>
      <label>
        Género
        <select
          value={value.genre ?? ""}
          onChange={(e) =>
            onChange({ ...value, genre: e.target.value || undefined })
          }
        >
          <option value="">Todos</option>
          <option value="rock-en-espanol">Rock en español</option>
          <option value="hard-rock">Hard rock</option>
          <option value="post-punk">Post punk</option>
          <option value="thrash-metal">Thrash metal</option>
        </select>
      </label>
      <label>
        Década
        <select
          value={value.decade ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              decade: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">Todas</option>
          <option value="1970">1970</option>
          <option value="1980">1980</option>
        </select>
      </label>
      <label>
        País
        <select
          value={value.country ?? ""}
          onChange={(e) =>
            onChange({ ...value, country: e.target.value || undefined })
          }
        >
          <option value="">Todos</option>
          <option value="MX">México</option>
          <option value="GB">Reino Unido</option>
          <option value="US">Estados Unidos</option>
          <option value="AR">Argentina</option>
        </select>
      </label>
      <button className="filter-reset" onClick={onReset}>
        Restablecer filtros
      </button>
    </div>
  );
}
