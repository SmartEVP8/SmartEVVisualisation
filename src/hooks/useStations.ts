import { mockStations, mockChargers } from '../data/mockStations';

export function useStations() {
  return {
    stations: mockStations,
    chargers: mockChargers,
    isLoading: false,
    error: null,
  };
}