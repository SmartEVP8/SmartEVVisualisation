import React, { useMemo, useCallback } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAtomValue, useSetAtom } from 'jotai';
import { stationsConfigAtom } from '@/store/simulationStore';
import type { StationConfig } from '@/store/simulationStore';
import {
  selectedStationAtom,
  selectedChargerIdAtom,
} from '@/store/uiStore';
import { StationMarker } from './StationMarker';

function StationMarkersComponent() {
  const stationsConfig = useAtomValue(stationsConfigAtom);
  const selectedChargerId = useAtomValue(selectedChargerIdAtom);
  const setSelectedStation = useSetAtom(selectedStationAtom);
  const setSelectedChargerId = useSetAtom(selectedChargerIdAtom);

  const stationsArray = useMemo(() => Object.values(stationsConfig), [stationsConfig]);

  const handleSelect = useCallback(
    (station: StationConfig) => {
      if (selectedChargerId !== null) {
        setSelectedChargerId(null);

        window.setTimeout(() => {
          setSelectedStation({ station });
        }, 300);

        return;
      }

      setSelectedStation({ station });
    },
    [selectedChargerId, setSelectedChargerId, setSelectedStation]
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