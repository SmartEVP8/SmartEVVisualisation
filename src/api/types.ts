export type WeightMetadata = {
  id: number;
  min: number;
  max: number;
  name: string;
};

export type WeightsResponse = Record<string, WeightMetadata>;

export type InitEngineConfig = {
  maximumEVs: number;
  seed: number;
  dualChargingProbability: number;
  numberOfChargers: number;
  costWeights: {
    costId: number;
    value: number;
  }[];
}

export type InitEngineStation = {
  id: number;
  address: string;
  pos: {
    lat: number;
    lon: number;
  };
};

export type InitEngineCharger = {
  id: number;
  maxEnergyKWh: number;
  stationId: number;
  isDual: boolean;
};

export type InitEngineResponse = {
  stations: InitEngineStation[];
  chargers: InitEngineCharger[];
};