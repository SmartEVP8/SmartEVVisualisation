import { mockStations, mockChargers } from '../data/mockStations';
import { mockChargerStates } from '../data/mockChargerState';

export function useStations() {
  return {
    stations: mockStations,
    chargers: mockChargers,
    chargerStates: mockChargerStates,
    isLoading: false,
    error: null,
  };
}