export type WeightMetadata = {
  id: number;
  min: number;
  max: number;
  name: string;
};

export type WeightsResponse = Record<string, WeightMetadata>;