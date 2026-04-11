import { useMemo, useState } from 'react';
import type { ChargerState } from '../types/chargerState';
import type { Charger, Station } from '../types/station';

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

type UseStationUiStateParams = {
  chargerStates: ChargerState[];
};

export function useStationUiState({ chargerStates }: UseStationUiStateParams) {
  const [selectedStation, setSelectedStation] = useState<SelectedStation>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isShowingRoutes, setIsShowingRoutes] = useState(false);

  const chargerStatesByChargerId = useMemo(() => {
    const map = new Map<number, ChargerState>();

    for (const chargerState of chargerStates) {
      map.set(chargerState.chargerId, chargerState);
    }

    return map;
  }, [chargerStates]);

  const selectStation = (station: Station, chargers: Charger[]) => {
    setSelectedStation({ station, chargers });
    setIsSidebarCollapsed(false);
    setIsShowingRoutes(false);
  };

  const clearSelection = () => {
    setSelectedStation(null);
    setIsSidebarCollapsed(false);
    setIsShowingRoutes(false);
  };

  const showRoutes = () => {
    setIsShowingRoutes(true);
  };

  const collapse = () => {
    setIsSidebarCollapsed(true);
    setIsShowingRoutes(true);
  };

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((current) => !current);
  };

  return {
    selectedStation,
    isSidebarCollapsed,
    isShowingRoutes,
    chargerStatesByChargerId,
    selectStation,
    clearSelection,
    showRoutes,
    collapse,
    toggleSidebarCollapsed,
  };
}
