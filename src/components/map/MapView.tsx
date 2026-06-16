import { evPositionsAtom, simulationStore } from '@/store/simulationStore';
import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet';
import { useState, useMemo } from 'react';
import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMapEvents, CircleMarker } from 'react-leaflet';
import { useAtomValue } from 'jotai';

const MIN_ZOOM_FOR_EV_FETCH = 11;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [58, 12.7],
];

const EV_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#AED6F1',
  '#FAD7A0', '#A3E4D7', '#EDBB99', '#D2B4DE', '#A9CCE3',
];

function getEVColor(evId: number): string {
  return EV_COLORS[evId % EV_COLORS.length];
}

function EVLayer() {
  const allPositions = useAtomValue(evPositionsAtom, { store: simulationStore });
  const [bounds, setBounds] = useState<{ sw: [number, number]; ne: [number, number] } | null>(null);
  const [enabled, setEnabled] = useState(false);

  useMapEvents({
    moveend: (e) => {
      const zoom = e.target.getZoom();
      if (zoom < MIN_ZOOM_FOR_EV_FETCH) {
        setEnabled(false);
        return;
      }
      setEnabled(true);
      const b = e.target.getBounds();
      setBounds({ sw: [b.getSouth(), b.getWest()], ne: [b.getNorth(), b.getEast()] });
    },
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      if (zoom < MIN_ZOOM_FOR_EV_FETCH) {
        setEnabled(false);
        return;
      }
      setEnabled(true);
      const b = e.target.getBounds();
      setBounds({ sw: [b.getSouth(), b.getWest()], ne: [b.getNorth(), b.getEast()] });
    },
  });

  const visibleEVs = useMemo(() => {
    if (!enabled || !bounds) return [];
    return Object.entries(allPositions).filter(([, pos]) =>
      pos.lat >= bounds.sw[0] && pos.lat <= bounds.ne[0] &&
      pos.lon >= bounds.sw[1] && pos.lon <= bounds.ne[1]);
  }, [allPositions, bounds, enabled]);

  return (
    <>
      {visibleEVs.map(([id, pos]) => (
        <CircleMarker
          key={id}
          center={[pos.lat, pos.lon]}
          radius={5}
          pathOptions={{
            fillOpacity: 1,
            weight: 1.5,
            fillColor: getEVColor(Number(id)),
            color: getEVColor(Number(id)),
          }}
        />
      ))}
    </>
  );
}

type MapViewProps = {
  children?: ReactNode;
  mapRef?: Ref<LeafletMap | null>;
};

export function MapView({ children, mapRef }: MapViewProps) {
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

        <EVLayer />

        {children}
        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}
