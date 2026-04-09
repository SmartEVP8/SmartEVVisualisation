import { apiGet } from './client';
import type { WeightMetadata, WeightsResponse } from './types';

export async function getWeights(): Promise<WeightMetadata[]> {
  const response = await apiGet<WeightsResponse>('/weights');
  return Object.values(response).sort((a, b) => a.id - b.id);
}