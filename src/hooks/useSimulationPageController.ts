import { useMemo } from 'react';
import type { InitEngineConfig } from '../api/types';
import type { Charger } from '../types/station';
import { useSimulationData } from './useSimulationData';
import { useSimulationSetupWeights } from './useSimulationSetupWeights';
import { useStationSelection } from './useStationSelection';

export function useSimulationPageController() {
  const simulation = useSimulationData();

  const setup = useSimulationSetupWeights(simulation.isSimulationStarting);

  const selection = useStationSelection({
    chargerStates: simulation.chargerStates,
  });

  const chargersByStationId = useMemo(() => {
    const map = new Map<number, Charger[]>();

    for (const charger of simulation.chargers) {
      const existing = map.get(charger.stationId) ?? [];
      existing.push(charger);
      map.set(charger.stationId, existing);
    }

    return map;
  }, [simulation.chargers]);

  const handleStartSimulation = async (config: InitEngineConfig) => {
    try {
      await simulation.startSimulation(config);
      setup.close();
      selection.resetSelection();
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  };

  return {
    ...simulation,
    ...setup,
    ...selection,
    chargersByStationId,
    handleStartSimulation,
  };
}