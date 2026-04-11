import React, { useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
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
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds());

  useEffect(() => {
    const updateBounds = () => setBounds(map.getBounds());
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map]);

  const visibleStations = useMemo(() => {
    if (!bounds) return stations;
    return stations.filter((station) =>
      bounds.contains([station.pos.lat, station.pos.lon])
    );
  }, [stations, bounds]);

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
      {visibleStations.map((station) => {
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
