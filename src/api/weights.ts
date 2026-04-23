import { apiGet, ApiPatch } from './client';
import type { WeightMetadata } from './types';

export type WeightsResponse = Record<string, WeightMetadata>;

export type UpdateWeightRequest = {
  costId?: number;
  value: number;
};

export async function getWeights(): Promise<WeightMetadata[]> {
  const response = await apiGet<WeightsResponse>('/weights');
  return Object.values(response);
}

export async function updateWeights(
  id: number,
  data: UpdateWeightRequest
): Promise<void> {
  return ApiPatch<void>(`/update-weights/${id}`, data);
}