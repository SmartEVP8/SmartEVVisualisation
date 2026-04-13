import React, { useMemo, useCallback } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAtomValue, useSetAtom } from 'jotai';
import { stationsConfigAtom } from '@/store/simulationStore';
import type { StationConfig } from '@/store/simulationStore';
import { selectedStationAtom } from '@/store/uiStore';
import { StationMarker } from './StationMarker';

function StationMarkersComponent() {
  const stationsConfig = useAtomValue(stationsConfigAtom);
  const setSelectedStation = useSetAtom(selectedStationAtom);

  const stationsArray = useMemo(() => Object.values(stationsConfig), [stationsConfig]);

  const handleSelect = useCallback(
    (station: StationConfig) => setSelectedStation({ station }),
    [setSelectedStation]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {stationsArray.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          onSelect={handleSelect}
        />
      ))}
    </MarkerClusterGroup>
  );
}

export const StationMarkers = React.memo(StationMarkersComponent);
