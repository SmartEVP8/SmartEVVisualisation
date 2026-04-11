import { useMemo } from 'react';
import type { InitEngineConfig } from '../api/types';
import type { Charger } from '../types/station';
import { useSimulationData } from './useSimulationData';
import { useSimulationSetupWeights } from './useSimulationSetupWeights';
import { useStationUiState } from './useStationUiState';

export function useSimulationPageController() {
  const simulationData = useSimulationData();

  const setupState = useSimulationSetupWeights(simulationData.isSimulationStarting);

  const stationUiState = useStationUiState({
    chargerStates: simulationData.chargerStates,
  });

  const chargersByStationId = useMemo(() => {
    const map = new Map<number, Charger[]>();

    for (const charger of simulationData.chargers) {
      const existing = map.get(charger.stationId) ?? [];
      existing.push(charger);
      map.set(charger.stationId, existing);
    }

    return map;
  }, [simulationData.chargers]);

  const startSimulationFromSetup = async (config: InitEngineConfig) => {
    try {
      await simulationData.startSimulation(config);
      setupState.close();
      stationUiState.clearSelection();
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  };

  return {
    simulation: {
      stations: simulationData.stations,
      hasStarted: simulationData.hasSimulationStarted,
      isStarting: simulationData.isSimulationStarting,
      error: simulationData.simulationError,
      start: startSimulationFromSetup,
      chargersByStationId,
      chargerStatesByChargerId: stationUiState.chargerStatesByChargerId,
    },
    setup: {
      isModalOpen: setupState.isOpen,
      isLoadingWeights: setupState.isLoadingWeights,
      weightsError: setupState.weightsError,
      weightMetadata: setupState.weightMetadata,
      initialCostWeights: setupState.initialCostWeights,
      openModal: setupState.open,
      closeModal: setupState.close,
    },
    selection: {
      selectedStation: stationUiState.selectedStation,
      selectStation: stationUiState.selectStation,
      clearSelection: stationUiState.clearSelection,
    },
    panel: {
      mode: stationUiState.panelMode,
      showRoutes: stationUiState.showRoutes,
      showSidebar: stationUiState.showSidebar,
    },
  };
}