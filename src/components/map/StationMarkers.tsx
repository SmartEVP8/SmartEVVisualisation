// components/map/StationMarkers.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAtomValue, useSetAtom } from 'jotai';
import { stationsConfigAtom } from '@/store/simulationStore';
import { selectedStationAtom } from '@/store/uiStore';
import { StationMarker } from './StationMarker';

function StationMarkersComponent() {
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds());

  const stationsConfig = useAtomValue(stationsConfigAtom);
  const setSelectedStation = useSetAtom(selectedStationAtom);

  useEffect(() => {
    const updateBounds = () => setBounds(map.getBounds());
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map]);

  const stationsArray = useMemo(() => Object.values(stationsConfig), [stationsConfig]);

  const visibleStations = useMemo(() => {
    if (!bounds) return stationsArray;
    return stationsArray.filter((station) =>
      bounds.contains([station.pos.lat, station.pos.lon])
    );
  }, [stationsArray, bounds]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={35}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {visibleStations.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          onSelect={() => setSelectedStation({ station })}
        />
      ))}
    </MarkerClusterGroup>
  );
}

export const StationMarkers = React.memo(StationMarkersComponent);
