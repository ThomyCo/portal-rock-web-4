import { useCallback, useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { listBands } from "../bands/api";
import { parseMapFilters, serializeMapFilters } from "./filterState";
import { MapFilters } from "./MapFilters";
import { BandMap } from "./BandMap";
import { AccessibleBandList } from "./AccessibleBandList";
export function MapPage() {
  const location = useLocation(),
    navigate = useNavigate(),
    filters = parseMapFilters(location.search),
    deferred = useDeferredValue(filters.query),
    [selected, setSelected] = useState<string>();
  const stable = { ...filters, query: deferred };
  const {
    data = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bands", stable],
    queryFn: () => listBands(stable),
  });
  const select = useCallback((id: string) => setSelected(id), []);
  const openBand = useCallback((slug: string) => navigate(`/bandas/${slug}`), [navigate]);
  function change(next: typeof filters) {
    navigate({ search: serializeMapFilters(next) }, { replace: true });
  }
  return (
    <main className="map-page">
      <section className="map-intro">
        <p className="eyebrow">ATLAS SONORO</p>
        <h1>Explora dónde comenzó el ruido.</h1>
        <p>Cada punto conecta una ciudad con una historia musical.</p>
      </section>
      <MapFilters
        value={filters}
        onChange={change}
        onReset={() => navigate({ search: "" })}
      />
      {isPending ? (
        <p role="status">Cargando bandas…</p>
      ) : isError ? (
        <p role="alert">
          No pudimos cargar el mapa.{" "}
          <button onClick={() => void refetch()}>Reintentar</button>
        </p>
      ) : data.length === 0 ? (
        <div className="empty">
          <h2>No encontramos bandas con estos filtros</h2>
          <button
            className="button button-ghost"
            onClick={() => navigate({ search: "" })}
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="map-layout">
          <BandMap bands={data} selectedId={selected} onSelect={select} onOpen={openBand} />
          <AccessibleBandList
            bands={data}
            selectedId={selected}
            onSelect={select}
          />
        </div>
      )}
    </main>
  );
}
