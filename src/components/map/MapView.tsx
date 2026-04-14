import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet';
import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';

type MapViewProps = {
  children?: ReactNode;
  mapRef?: Ref<LeafletMap | null>;
};

const key = import.meta.env.VITE_MAPTILER_KEY as string;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [58, 12.7],
];

export function MapView({ children, mapRef }: MapViewProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        minZoom={7}
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
          updateWhenIdle={false}
          updateWhenZooming={false}
          attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
        />

        {children}

        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}
