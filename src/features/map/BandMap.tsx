import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { BandSummary } from '../bands/types'
import { MapFallback } from './MapFallback'
import { createBandPreview } from './bandPreview'
import { getDisplayCoordinates } from './bandCoordinates'

maplibregl.setWorkerUrl(mapWorkerUrl)

export function BandMap({ bands, selectedId, onSelect, onOpen }: { bands: BandSummary[]; selectedId?: string; onSelect: (id: string) => void; onOpen: (slug: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const supported = typeof window !== 'undefined' && Boolean(window.WebGLRenderingContext)
  useEffect(() => {
    if (!host.current || !supported) return
    const map = new maplibregl.Map({ container: host.current, style: 'https://tiles.openfreemap.org/styles/positron', center: [-25, 25], zoom: 1.35, attributionControl: {} })
    mapRef.current = map
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 16, className: 'band-map-popup' })
    map.on('load', () => {
      map.addSource('bands', { type: 'geojson', cluster: true, data: { type: 'FeatureCollection', features: bands.map(band => ({ type: 'Feature', geometry: { type: 'Point', coordinates: getDisplayCoordinates(band, bands) }, properties: { id: band.id, name: band.name } })) } })
      map.addLayer({ id: 'clusters', type: 'circle', source: 'bands', filter: ['has', 'point_count'], paint: { 'circle-color': '#f15a2b', 'circle-radius': 22 } })
      map.addLayer({ id: 'points', type: 'circle', source: 'bands', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#ffca6a', 'circle-radius': 9, 'circle-stroke-color': '#17120d', 'circle-stroke-width': 3 } })
      map.on('mouseenter', 'points', (event: maplibregl.MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer'
        const id = event.features?.[0]?.properties?.id
        const band = bands.find(item => item.id === id)
        if (band) popup.setLngLat(getDisplayCoordinates(band, bands)).setDOMContent(createBandPreview(band)).addTo(map)
      })
      map.on('mouseleave', 'points', () => { map.getCanvas().style.cursor = ''; popup.remove() })
      map.on('click', 'points', (event: maplibregl.MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id
        const band = bands.find(item => item.id === id)
        if (band) { onSelect(band.id); onOpen(band.slug) }
      })
    })
    return () => map.remove()
  }, [bands, onOpen, onSelect, supported])
  useEffect(() => {
    const band = bands.find(item => item.id === selectedId)
    if (band && mapRef.current) mapRef.current.flyTo({ center: [band.longitude, band.latitude], zoom: 7, essential: false })
  }, [selectedId, bands])
  return supported ? <div ref={host} className="map-canvas" aria-label="Mapa interactivo de orígenes musicales" /> : <MapFallback bands={bands} onSelect={onSelect} />
}
