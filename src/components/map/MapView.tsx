import { getEVs, type EVPosition } from '@/api/evPositions';
import type { Position } from '@/store/simulationStore';
import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet';
import { useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMapEvents, CircleMarker } from 'react-leaflet';

const MIN_ZOOM_FOR_EV_FETCH = 13;

function getViewportBounds(map: LeafletMap): [Position, Position] {
  const bounds = map.getBounds();
  return [
    { lat: bounds.getSouth(), lon: bounds.getWest() },
    { lat: bounds.getNorth(), lon: bounds.getEast() },
  ];
}

type MapEventHandlerParams = {
  onEVsFetched: (evs: EVPosition[]) => void
  onClear: () => void
}

function MapEventHandler({ onEVsFetched, onClear }: MapEventHandlerParams) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startPolling(map: LeafletMap) {
    stopPolling();
    fetchEVsForViewport(map);
    intervalRef.current = setInterval(() => fetchEVsForViewport(map), 500);
  }

  async function fetchEVsForViewport(map: LeafletMap) {
    const [southWest, northEast] = getViewportBounds(map);
    const evs = await getEVs(southWest, northEast);
    onEVsFetched(evs);
  }

  useMapEvents({
    moveend: (e) => {
      if (e.target.getZoom() < MIN_ZOOM_FOR_EV_FETCH) {
        stopPolling();
        onClear();
        return;
      }
      startPolling(e.target);
    },
    zoomend: (e) => {
      if (e.target.getZoom() < MIN_ZOOM_FOR_EV_FETCH) {
        stopPolling();
        onClear();
        return;
      }
      startPolling(e.target);
    },
  });

  return null;
}

type MapViewProps = {
  children?: ReactNode;
  mapRef?: Ref<LeafletMap | null>;
};

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [58, 12.7],
];

export function MapView({ children, mapRef }: MapViewProps) {
  const [evs, setEvs] = useState<EVPosition[]>([]);
  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        minZoom={7}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }}
        bounds={boundingBox}
        maxBounds={boundingBox}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxNativeZoom={19}
          maxZoom={19}
          tileSize={256}
          noWrap
          updateWhenIdle={false}
          updateWhenZooming={false}
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        <MapEventHandler onClear={() => setEvs([])} onEVsFetched={setEvs} />

        {evs.map((ev) => {
          return (
            <CircleMarker
              key={ev.id}
              center={[ev.position.lat, ev.position.lon]}
              radius={5}
              pathOptions={{
                fillOpacity: 1,
                weight: 1.5,
              }}
            />
          );
        })}

        {children}
        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}
