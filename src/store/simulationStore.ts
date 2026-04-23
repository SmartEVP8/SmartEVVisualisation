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
  finishTimeMs: number;
};

export type ChargerState = {
  isActive: boolean;
  utilization: number;
  chargerId: number;
  chargingEVs: EVInQueue[]; // always 0-2 elements
  queue: EVInQueue[];
};

export type EVOnRoute = {
  id: number;
  waypoints: Position[];
};

export type QueueAlert = {
  stationId: number;
  address: string;
  queueLength: number;
  updatedAt: number;
};

// INFO: Store and updates

export const simulationStore = createStore();

const CRITICAL_QUEUE_THRESHOLD = 100;

// --- Static Atoms ---
export const stationsConfigAtom = atom<Record<number, StationConfig>>({});
export const chargersConfigAtom = atom<Record<number, ChargerConfig>>({});

// --- Dynamic Atoms ---
export const evsOnRouteAtom = atom<Record<number, EVOnRoute[]>>({});
export const simulationTimeAtom = atom<number>(0);
export const globalStatsAtom = atom({ totalEvs: 0, totalCharging: 0 });
export const queueAlertsAtom = atom<Record<number, QueueAlert>>({});
export const stationQueueLengthsAtom = atom<Record<number, number>>({});

const chargerStateAtomCache = new Map<number, PrimitiveAtom<Record<number, ChargerState>>>();

export function getChargerStatesAtom(stationId: number) {
  if (!chargerStateAtomCache.has(stationId)) {
    chargerStateAtomCache.set(stationId, atom<Record<number, ChargerState>>({}));
  }
  return chargerStateAtomCache.get(stationId)!;
}

const stationStatusCache = new Map<number, Atom<StationStatus>>();

export function getStationStatusAtom(stationId: number) {
  if (!stationStatusCache.has(stationId)) {
    stationStatusCache.set(
      stationId,
      atom((get): StationStatus => {
        const chargers = get(chargersConfigAtom);
        const states = get(getChargerStatesAtom(stationId));

        let totalQueue = 0;

        for (const charger of Object.values(chargers)) {
          if (charger.stationId !== stationId) continue;
          totalQueue += states[charger.id]?.queue.length ?? 0;
        }

        if (totalQueue === 0) return 'idle';
        if (totalQueue < 20) return 'busy';
        return 'full';
      }),
    );
  }

  return stationStatusCache.get(stationId)!;
}

// --- Mutation Actions ---
export const handleInitEngineDataAction = atom(null, (_get, set, payload: InitEngineData) => {
  const stationsRecord: Record<number, StationConfig> = {};
  const initialQueuesRecord: Record<number, number> = {};

  for (const s of payload.stations) {
    stationsRecord[s.id] = {
      id: s.id,
      pos: {
        lat: s.pos?.lat ?? 0,
        lon: s.pos?.lon ?? 0,
      },
      address: s.address,
    };
    initialQueuesRecord[s.id] = 0;
  }

  const chargersRecord: Record<number, ChargerConfig> = {};
  for (const c of payload.chargers) {
    chargersRecord[c.id] = {
      id: c.id,
      maxEnergyKWh: c.maxPowerKw,
      isDual: c.isDual,
      stationId: c.stationId,
    };
  }

  set(stationsConfigAtom, stationsRecord);
  set(chargersConfigAtom, chargersRecord);
  set(stationQueueLengthsAtom, initialQueuesRecord);
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
  },
);

export const handleUpdateStationState = atom(null, (get, set, payload: StationState) => {
  const stationChargerStates: Record<number, ChargerState> = {};
  let totalQueueLength = 0;

  for (const cs of payload.chargerStates) {
    const queue: EVInQueue[] = cs.evsInQueue.map((ev) => ({
      id: ev.evId,
      soc: ev.soc,
      targetSoC: ev.targetSoc,
      finishTimeMs: ev.finishTimeMs,
    }));

    const chargingEVs: EVInQueue[] = cs.evsCharging.map((ev) => ({
      id: ev.evId,
      soc: ev.soc,
      targetSoC: ev.targetSoc,
      finishTimeMs: ev.finishTimeMs,
    }));

    stationChargerStates[cs.chargerId] = {
      isActive: cs.isActive,
      utilization: cs.utilization,
      chargerId: cs.chargerId,
      queue,
      chargingEVs,
    };

    totalQueueLength += queue.length;
  }

  set(stationQueueLengthsAtom, (prev) => ({
    ...prev,
    [payload.stationId]: totalQueueLength,
  }));

  set(getChargerStatesAtom(payload.stationId), stationChargerStates);

  set(evsOnRouteAtom, (prev) => ({
    ...prev,
    [payload.stationId]: payload.evsOnRoute.map((ev) => ({
      id: ev.evId,
      waypoints: ev.waypoints.map((wp) => ({
        lat: wp.lat,
        lon: wp.lon,
      })),
    })),
  }));

  const stations = get(stationsConfigAtom);
  const station = stations[payload.stationId];

  if (totalQueueLength > CRITICAL_QUEUE_THRESHOLD) {
    set(queueAlertsAtom, (prev) => ({
      ...prev,
      [payload.stationId]: {
        stationId: payload.stationId,
        address: station?.address ?? `Station ${payload.stationId}`,
        queueLength: totalQueueLength,
        updatedAt: Date.now(),
      },
    }));
  } else {
    set(queueAlertsAtom, (prev) => {
      if (!(payload.stationId in prev)) return prev;

      const next = { ...prev };
      delete next[payload.stationId];
      return next;
    });
  }
});

export const dismissQueueAlertAction = atom(null, (_get, set, stationId: number) => {
  set(queueAlertsAtom, (prev) => {
    if (!(stationId in prev)) return prev;

    const next = { ...prev };
    delete next[stationId];
    return next;
  });
});

export const clearAllQueueAlertsAction = atom(null, (_get, set) => {
  set(queueAlertsAtom, {});
});

export const dispatchWSEventAction = atom(
  null,
  (_get, set, payload: Exclude<Envelope['payload'], { case: undefined }>) => {
    switch (payload.case) {
      case 'stateUpdate':
        set(handleSimulationSnapshotAction, payload.value);
        break;
      case 'stationStateResponse':
        set(handleUpdateStationState, payload.value);
        break;
      case 'initEngineData':
        set(handleInitEngineDataAction, payload.value);
        break;
      default:
        console.warn('Unhandled event type routed to store:', payload);
    }
  },
);
