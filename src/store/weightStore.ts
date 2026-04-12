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
