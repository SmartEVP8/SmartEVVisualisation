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
  activeEVId: EVChargerState | null;
  evsInQueue: EVChargerState[];
};