import { atom } from 'jotai/vanilla';
import { resetSimulationAction } from './simulationStore';
import { resetSimulationUiAction } from './uiStore';
import { resetWeightsAction } from './weightStore';

export const resetAllStoresAction = atom(null, (_get, set) => {
    set(resetSimulationAction);
    set(resetSimulationUiAction);
    set(resetWeightsAction);
});