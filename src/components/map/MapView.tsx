import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet';
import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';

type MapViewProps = {
  children?: ReactNode;
  mapRef?: Ref<LeafletMap | null>;
};

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

        {children}

        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}
