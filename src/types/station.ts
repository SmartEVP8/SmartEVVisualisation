export type Position = {
  lat: number;
  lon: number;
};

export type Station = {
  id: number;
  pos: Position;
  address: string;
};

export type Charger = {
  id: number;
  maxPowerKW: number;
  isDual: boolean;
  stationId: number;
};