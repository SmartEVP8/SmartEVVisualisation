import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet';
import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';

type MapViewProps = {
  children?: ReactNode;
  mapRef?: Ref<LeafletMap | null>;
};

const key = import.meta.env.VITE_MAPTILER_KEY as string;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [57.8, 12.7],
];

export function MapView({ children, mapRef }: MapViewProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        minZoom={8}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        bounds={boundingBox}
        maxBounds={boundingBox}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`}
          tileSize={512}
          zoomOffset={-1}
          noWrap
          attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
        />

        {children}

        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}