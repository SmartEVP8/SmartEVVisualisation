import { atom } from 'jotai';
import type { StationConfig } from './simulationStore';

export type SelectedStationPayload = {
  station: StationConfig;
} | null;

export const selectedStationAtom = atom<SelectedStationPayload>(null);
export const isSidebarCollapsedAtom = atom(false);
export const isShowingRoutesAtom = atom(false);
export const isWeightSidebarCollapsedAtom = atom(false);
export const selectedChargerIdAtom = atom<number | null>(null);

export const clearSelectionAction = atom(
  null,
  (get, set) => {
    set(selectedStationAtom, null);
    set(isSidebarCollapsedAtom, false);
    set(isShowingRoutesAtom, false);
  }
);

export const resetSimulationUiAction = atom(null, (_get, set) => {
  set(selectedStationAtom, null);
  set(selectedChargerIdAtom, null);
  set(isSidebarCollapsedAtom, false);
  set(isShowingRoutesAtom, false);
  set(isWeightSidebarCollapsedAtom, false);
});

