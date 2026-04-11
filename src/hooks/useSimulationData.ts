import { useState } from 'react';
import { initializeSimulation } from '../api/init';
import type { InitEngineConfig, InitEngineResponse } from '../api/types';
import type { ChargerState } from '../types/chargerState';
import type { Charger, Station } from '../types/station';

function mapInitResponseToStations(response: InitEngineResponse): Station[] {
  return response.stations.map((station) => ({
    id: station.id,
    address: station.address,
    pos: {
      lat: station.pos?.lat ?? 0,
      lon: station.pos?.lon ?? 0,
    },
  }));
}

function mapInitResponseToChargers(response: InitEngineResponse): Charger[] {
  return response.chargers.map((charger) => ({
    id: charger.id,
    maxEnergyKWh: charger.maxEnergyKWh,
    isDual: charger.isDual,
    stationId: charger.stationId,
  }));
}

export function useSimulationData() {
  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargerStates, setChargerStates] = useState<ChargerState[]>([]);

  const [isSimulationStarting, setIsSimulationStarting] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [hasSimulationStarted, setHasSimulationStarted] = useState(false);

  const startSimulation = async (config: InitEngineConfig) => {
    try {
      setIsSimulationStarting(true);
      setSimulationError(null);

      const response = await initializeSimulation(config);

      setStations(mapInitResponseToStations(response));
      setChargers(mapInitResponseToChargers(response));
      setChargerStates([]);
      setHasSimulationStarted(true);
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : 'Failed to initialize simulation'
      );
      throw error;
    } finally {
      setIsSimulationStarting(false);
    }
  };

  return {
    stations,
    chargers,
    chargerStates,
    setChargerStates,
    isSimulationStarting,
    simulationError,
    hasSimulationStarted,
    startSimulation,
  };
}