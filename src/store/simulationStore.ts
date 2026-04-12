import { atom, createStore } from 'jotai/vanilla';
import type { ArrivalEvent, ChargingEndEvent, Envelope, InitEngineData, SimulationSnapshot, StationState } from '@/api/generated/api_pb';

// INFO : Models
type Position = {
  lat: number;
  lon: number;
};

// --- Static Configurations ---

type StationConfig = {
  id: number;
  pos: Position;
  address: string;
};

type ChargerConfig = {
  id: number;
  maxEnergyKWh: number;
  isDual: boolean;
  stationId: number;
};

// --- Mutable States ---
type EVInQueue = {
  id: number;
  soc: number;
  targetSoC: number;
};

type ChargerState = {
  isActive: boolean;
  utilization: number;
  chargerId: number;
  queue: EVInQueue[];
};

type EVOnRoute = {
  id: number;
  waypoints: Position[];
};

// INFO: Store and updates

export const simulationStore = createStore();

// --- Static Atoms (Populated via InitEngineData) ---
export const stationsConfigAtom = atom<Record<number, StationConfig>>({});
export const chargersConfigAtom = atom<Record<number, ChargerConfig>>({});

// --- Dynamic Atoms (Updated via WS Events) ---
export const chargerStatesAtom = atom<Record<number, ChargerState>>({});
export const evsOnRouteAtom = atom<Record<number, EVOnRoute[]>>({});
export const simulationTimeAtom = atom<number>(0);
export const globalStatsAtom = atom({ totalEvs: 0, totalCharging: 0 });


// Sets the immutable config for stations and chargers.
export const handleInitEngineDataAction = atom(
  null,
  (get, set, payload: InitEngineData) => {
    const stationsRecord: Record<number, StationConfig> = {};
    payload.stations.forEach((s: any) => {
      stationsRecord[s.id] = { id: s.id, pos: s.pos, address: s.address };
    });

    const chargersRecord: Record<number, ChargerConfig> = {};
    payload.chargers.forEach((c: any) => {
      chargersRecord[c.id] = {
        id: c.id,
        maxEnergyKWh: c.maxPowerKw,
        isDual: c.isDual,
        stationId: c.stationId
      };
    });

    set(stationsConfigAtom, stationsRecord);
    set(chargersConfigAtom, chargersRecord);
  }
);

// --- Mutation Actions ---
export const handleArrivalEvent = atom(
  null,
  (get, set, payload: ArrivalEvent) => {

  }
)

export const handleEndChargingEvent = atom(
  null,
  (get, set, payload: ChargingEndEvent) => {

  }
)

export const handleSimulationSnapshotAction = atom(
  null,
  (get, set, payload: SimulationSnapshot) => {
    set(simulationTimeAtom, Number(payload.simulationTimeMs));
    set(globalStatsAtom, {
      totalEvs: payload.totalEvs,
      totalCharging: payload.totalCharging
    });
  }
)
export const handleUpdateStationState = atom(
  null,
  (get, set, payload: StationState) => {
    const stationId = payload.stationId;

    set(chargerStatesAtom, (prev) => {
      const updatedStates = { ...prev };
      payload.chargerStates.forEach((cs) => {
        updatedStates[cs.chargerId] = {
          isActive: cs.isActive,
          utilization: cs.utilization,
          chargerId: cs.chargerId,
          queue: cs.evsInQueue.map((ev) => ({
            id: ev.evId,
            soc: ev.soc,
            targetSoC: ev.targetSoc
          }))
        };
      });
      return updatedStates;
    });

    set(evsOnRouteAtom, (prev) => ({
      ...prev,
      [stationId]: payload.evsOnRoute.map((ev) => ({
        id: ev.evId,
        waypoints: ev.waypoints
      }))
    }));
  }
);

export const dispatchWSEventAction = atom(
  null,
  (get, set, payload: Exclude<Envelope["payload"], { case: undefined }>) => {
    switch (payload.case) {
      case "arrival":
        set(handleArrivalEvent, payload.value);
        break;
      case "chargingEnd":
        set(handleEndChargingEvent, payload.value);
        break;
      case "stateUpdate":
        set(handleSimulationSnapshotAction, payload.value);
        break;
      case "stationStateResponse":
        set(handleUpdateStationState, payload.value);
        break;
      case "getStationSnapshot":
        console.warn("Client received a client-only request type.");
        break;
      case "initEngineData":
        set(handleInitEngineDataAction, payload.value)
        break;
      default:
        console.warn("Unhandled event type routed to store:", payload);
    }
  }
);
