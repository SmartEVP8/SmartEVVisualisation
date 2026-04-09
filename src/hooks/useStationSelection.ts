import { useMemo, useState } from 'react';
import type { Charger, Station } from '../types/station';
import type { ChargerState } from '../types/chargerState';

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

type UseStationSelectionParams = {
  chargerStates: ChargerState[];
};

export function useStationSelection({
  chargerStates,
}: UseStationSelectionParams) {
  const [selectedStation, setSelectedStation] = useState<SelectedStation>(null);
  const [selectedChargerId, setSelectedChargerId] = useState<number | null>(null);

  const chargerStatesByChargerId = useMemo(() => {
    const map = new Map<number, ChargerState>();

    for (const chargerState of chargerStates) {
      map.set(chargerState.chargerId, chargerState);
    }

    return map;
  }, [chargerStates]);

  const selectedCharger = useMemo(() => {
    if (!selectedStation || selectedChargerId === null) {
      return null;
    }

    return (
      selectedStation.chargers.find((charger) => charger.id === selectedChargerId) ??
      null
    );
  }, [selectedStation, selectedChargerId]);

  const selectedChargerState = useMemo(() => {
    if (selectedChargerId === null) {
      return null;
    }

    return chargerStatesByChargerId.get(selectedChargerId) ?? null;
  }, [chargerStatesByChargerId, selectedChargerId]);

  const selectStation = (station: Station, chargers: Charger[]) => {
    setSelectedStation({ station, chargers });
    setSelectedChargerId(null);
  };

  const closeStation = () => {
    setSelectedStation(null);
    setSelectedChargerId(null);
  };

  const closeCharger = () => {
    setSelectedChargerId(null);
  };

  const resetSelection = () => {
    setSelectedStation(null);
    setSelectedChargerId(null);
  };

  return {
    selectedStation,
    selectedChargerId,
    selectedCharger,
    selectedChargerState,
    chargerStatesByChargerId,
    setSelectedChargerId,
    selectStation,
    closeStation,
    closeCharger,
    resetSelection,
  };
}