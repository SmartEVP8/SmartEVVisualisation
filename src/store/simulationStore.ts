import { atom, createStore, type Atom, type PrimitiveAtom } from 'jotai/vanilla';
import type { Envelope, InitEngineData, SimulationSnapshot, StationState } from '@/api/generated/api_pb';
import type { StationStatus } from '@/components/map/StationMarker';

// INFO : Models
export type Position = {
  lat: number;
  lon: number;
};

// --- Static Configurations ---

export type StationConfig = {
  id: number;
  pos: Position;
  address: string;
};

export type ChargerConfig = {
  id: number;
  maxEnergyKWh: number;
  isDual: boolean;
  stationId: number;
};

// --- Mutable States ---
export type EVInQueue = {
  id: number;
  soc: number;
  targetSoC: number;
};

export type ChargerState = {
  isActive: boolean;
  utilization: number;
  chargerId: number;
  chargingEVs: EVInQueue[] // always 0-2 elements
  queue: EVInQueue[];
};

export type EVOnRoute = {
  id: number;
  waypoints: Position[];
};

// INFO: Store and updates

export const simulationStore = createStore();

// --- Static Atoms ---
export const stationsConfigAtom = atom<Record<number, StationConfig>>({});
export const chargersConfigAtom = atom<Record<number, ChargerConfig>>({});

// --- Dynamic Atoms ---
export const evsOnRouteAtom = atom<Record<number, EVOnRoute[]>>({});
export const simulationTimeAtom = atom<number>(0);
export const globalStatsAtom = atom({ totalEvs: 0, totalCharging: 0 });

const chargerStateAtomCache = new Map<number, PrimitiveAtom<Record<number, ChargerState>>>();

export function getChargerStatesAtom(stationId: number) {
  if (!chargerStateAtomCache.has(stationId)) {
    chargerStateAtomCache.set(stationId, atom<Record<number, ChargerState>>({}));
  }
  return chargerStateAtomCache.get(stationId)!;
}

const STATUS_RANK: Record<StationStatus, number> = { idle: 0, busy: 1, full: 2 };
const stationStatusCache = new Map<number, Atom<StationStatus>>();

export function getStationStatusAtom(stationId: number) {
  if (!stationStatusCache.has(stationId)) {
    stationStatusCache.set(
      stationId,
      atom((get): StationStatus => {
        const chargers = get(chargersConfigAtom);
        const states = get(getChargerStatesAtom(stationId));

        let rank = 0;
        for (const charger of Object.values(chargers)) {
          if (charger.stationId !== stationId) continue;
          const queueLen = states[charger.id]?.queue.length ?? 0;
          const next: StationStatus = queueLen === 0 ? 'idle' : queueLen < 3 ? 'busy' : 'full';
          if (STATUS_RANK[next] > rank) rank = STATUS_RANK[next];
        }
        return (['idle', 'busy', 'full'] as const)[rank];
      })
    );
  }
  return stationStatusCache.get(stationId)!;
}

// --- Mutation Actions ---
export const handleInitEngineDataAction = atom(null, (get, set, payload: InitEngineData) => {
  const stationsRecord: Record<number, StationConfig> = {};
  payload.stations.forEach((s: any) => {
    stationsRecord[s.id] = { id: s.id, pos: s.pos, address: s.address };
  });

  const chargersRecord: Record<number, ChargerConfig> = {};
  payload.chargers.forEach((c: any) => {
    chargersRecord[c.id] = { id: c.id, maxEnergyKWh: c.maxPowerKw, isDual: c.isDual, stationId: c.stationId };
  });

  set(stationsConfigAtom, stationsRecord);
  set(chargersConfigAtom, chargersRecord);
});


export const handleSimulationSnapshotAction = atom(
  null,
  (get, set, payload: SimulationSnapshot) => {
    const incomingTime = Number(payload.simulationTimeMs);
    const currentTime = get(simulationTimeAtom);

    if (incomingTime < currentTime) {
      console.warn('Ignoring stale simulation snapshot', {
        incomingTime,
        currentTime,
        totalEvs: payload.totalEvs,
        totalCharging: payload.totalCharging,
      });
      return;
    }

    set(simulationTimeAtom, incomingTime);
    set(globalStatsAtom, {
      totalEvs: payload.totalEvs,
      totalCharging: payload.totalCharging,
    });
  }
);

export const handleUpdateStationState = atom(null, (get, set, payload: StationState) => {
  const stationChargerStates: Record<number, ChargerState> = {};
  payload.chargerStates.forEach((cs) => {
    stationChargerStates[cs.chargerId] = {
      isActive: cs.isActive,
      utilization: cs.utilization,
      chargerId: cs.chargerId,
      queue: cs.evsInQueue.map((ev) => ({ id: ev.evId, soc: ev.soc, targetSoC: ev.targetSoc })),
      chargingEVs: cs.evsCharging.map((ev) => ({ id: ev.evId, soc: ev.soc, targetSoC: ev.targetSoc })),
    };
  });

  set(getChargerStatesAtom(payload.stationId), stationChargerStates);

  set(evsOnRouteAtom, (prev) => ({
    ...prev,
    [payload.stationId]: payload.evsOnRoute.map((ev) => ({ id: ev.evId, waypoints: ev.waypoints }))
  }));
});

export const dispatchWSEventAction = atom(
  null,
  (get, set, payload: Exclude<Envelope["payload"], { case: undefined }>) => {
    switch (payload.case) {
      case "stateUpdate":
        set(handleSimulationSnapshotAction, payload.value);
        break;
      case "stationStateResponse":
        set(handleUpdateStationState, payload.value);
        break;
      case "initEngineData":
        set(handleInitEngineDataAction, payload.value);
        break;
      default:
        console.warn("Unhandled event type routed to store:", payload);
    }
  }
);
