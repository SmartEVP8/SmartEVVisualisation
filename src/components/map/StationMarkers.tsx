import React from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { Charger, Station } from '../../types/station';
import { StationMarker } from './StationMarker';

type Props = {
  hasStarted: boolean;
  stations: Station[];
  chargersByStationId: Map<number, Charger[]>;
  onSelect: (station: Station, chargers: Charger[]) => void;
};

function StationMarkersComponent({
  hasStarted,
  stations,
  chargersByStationId,
  onSelect,
}: Props) {
  if (!hasStarted) {
    return null;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={35}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {stations.map((station) => {
        const stationChargers = chargersByStationId.get(station.id) ?? [];

        return (
          <StationMarker
            key={station.id}
            station={station}
            chargers={stationChargers}
            onSelect={onSelect}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

export const StationMarkers = React.memo(StationMarkersComponent);
