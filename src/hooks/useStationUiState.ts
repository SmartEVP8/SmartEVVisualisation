import { useMemo, useState } from 'react';
import type { ChargerState } from '../types/chargerState';
import type { Charger, Station } from '../types/station';

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

type PanelMode = 'sidebar' | 'routes';

type UseStationUiStateParams = {
  chargerStates: ChargerState[];
};

export function useStationUiState({ chargerStates }: UseStationUiStateParams) {
  const [selectedStation, setSelectedStation] = useState<SelectedStation>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('sidebar');

  const chargerStatesByChargerId = useMemo(() => {
    const map = new Map<number, ChargerState>();

    for (const chargerState of chargerStates) {
      map.set(chargerState.chargerId, chargerState);
    }

    return map;
  }, [chargerStates]);

  const selectStation = (station: Station, chargers: Charger[]) => {
    setSelectedStation({ station, chargers });
    setPanelMode('sidebar');
  };

  const clearSelection = () => {
    setSelectedStation(null);
    setPanelMode('sidebar');
  };

  const showRoutes = () => {
    setPanelMode('routes');
  };

  const showSidebar = () => {
    setPanelMode('sidebar');
  };

  return {
    selectedStation,
    panelMode,
    chargerStatesByChargerId,
    selectStation,
    clearSelection,
    showRoutes,
    showSidebar,
  };
}
