import { apiGet } from './client';
import type { WeightMetadata } from './types';

export type WeightsResponse = Record<string, WeightMetadata>;

export async function getWeights(): Promise<WeightMetadata[]> {
  const response = await apiGet<WeightsResponse>('/weights');
  return Object.values(response);
}
