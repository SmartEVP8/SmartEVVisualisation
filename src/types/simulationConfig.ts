export type CostWeights = {
    id: number;
    updatedValue: number;
}

export type StationGenerationOptions = {
    dualChargingProbability: number;
    numberOfChargers: number;
};

export type InitRequest = {
    costWeights: CostWeights[];
    stationGenerationOptions: StationGenerationOptions;
    maximumNumberOfEVs: number;
    seed: number; 
}