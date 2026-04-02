import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { LatLngBoundsExpression } from 'leaflet';
import type { Station, Charger } from '../../types/station';
import { StationMarker } from './StationMarker';

type MapViewProps = {
  stations: Station[];
  chargers: Charger[];
};

const key = import.meta.env.VITE_MAPTILER_KEY as string;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [57.8, 12.7],
];

export function MapView({ stations, chargers }: MapViewProps) {
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
        noWrap
        attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
      />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={35}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
      >
        {stations.map((station) => {
          const stationChargers = chargers.filter(
            (charger) => charger.stationId === station.id,
          );

          return (
            <StationMarker
              key={station.id}
              station={station}
              chargers={stationChargers}
            />
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}