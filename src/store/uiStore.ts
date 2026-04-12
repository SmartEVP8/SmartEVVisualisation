import { atom } from 'jotai';
import type { StationConfig } from './simulationStore';

export type SelectedStationPayload = {
  station: StationConfig;
} | null;

export const selectedStationAtom = atom<SelectedStationPayload>(null);
export const isSidebarCollapsedAtom = atom(false);
export const isShowingRoutesAtom = atom(false);

export const clearSelectionAction = atom(
  null,
  (get, set) => {
    set(selectedStationAtom, null);
    set(isSidebarCollapsedAtom, false);
    set(isShowingRoutesAtom, false);
  }
);
