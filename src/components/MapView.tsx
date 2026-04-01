import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

const key = import.meta.env.VITE_MAPTILER_KEY as string;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [57.8, 12.7],
];

export function MapView() {
  return (
    <MapContainer
        minZoom={8}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        bounds={boundingBox}
        maxBounds={boundingBox}
        maxBoundsViscosity={1.0}
        >
      <TileLayer
        url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`}
        tileSize={512}
        zoomOffset={-1}
        noWrap={true}
        attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
}