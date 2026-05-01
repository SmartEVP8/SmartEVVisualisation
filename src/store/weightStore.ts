import { atom } from 'jotai/vanilla';
import type { WeightMetadata } from '../api/types';

type Weight = WeightMetadata & {
  value: number
}

export const weightMetadataAtom = atom<Weight[]>([]);

export const setFullWeightsAction = atom(
  null,
  (get, set, newWeights: Weight[]) => {
    set(weightMetadataAtom, newWeights);
  }
);

export const setSingleWeightAction = atom(
  null,
  (get, set, payload: { id: number; value: number }) => {
    const currentWeights = get(weightMetadataAtom);
    const updatedWeights = currentWeights.map((weight) =>
      weight.id === payload.id ? { ...weight, value: payload.value } : weight
    );
    set(weightMetadataAtom, updatedWeights);
  }
);

export const resetWeightsAction = atom(null, (_get, set) => {
  set(weightMetadataAtom, []);
});
