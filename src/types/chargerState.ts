export type EVChargerState = {
  evID: number;
  SoC: number;
  targetSoC: number;
};

export type ChargerState = {
  isActive: boolean;
  utilization: number;
  chargerId: number;
  queueSize: number;
  evsInQueue: EVChargerState[];
};

// Fake data for development
export const fakeEVChargerStates: EVChargerState[] = [
  { evID: 1001, SoC: 0.25, targetSoC: 0.8 },
  { evID: 1002, SoC: 0.45, targetSoC: 0.9 },
  { evID: 1003, SoC: 0.15, targetSoC: 0.85 },
  { evID: 1004, SoC: 0.6, targetSoC: 0.95 },
  { evID: 1005, SoC: 0.35, targetSoC: 0.75 },
];