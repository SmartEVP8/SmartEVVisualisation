import { dispatchWSEventAction, simulationStore } from '@/store/simulationStore';
import { startSimulationWS, closeSimulationWS } from '@/api/ws';
import { fromBinary } from '@bufbuild/protobuf';
import { apiPost, apiPostBinary } from './client';
import { EnvelopeSchema } from './generated/api_pb';

export type InitEngineConfig = {
  maximumEVs: number;
  seed: number;
  dualChargerProbability: number;
  numberOfChargers: number;
  processorCount: number;
  costWeights: {
    costId: number;
    value: number;
  }[];
  startTime: number;
  endTime: number;
};

export type SimulationResponse = {
  message: string;
};


export const startSimulation = async (config: InitEngineConfig) => {
  closeSimulationWS(); // Ensure any existing connections are closed before starting a new simulation
  const payload = await initSimulation(config);

  simulationStore.set(dispatchWSEventAction, payload);
  startSimulationWS();
};

async function initSimulation(config: InitEngineConfig) {
  const data = await apiPostBinary('/init-engine', config);
  const envelope = fromBinary(EnvelopeSchema, data);

  if (envelope.payload.case !== 'initEngineData') {
    throw new Error(
      envelope.payload.case
        ? `Unexpected payload case: ${envelope.payload.case}`
        : 'Envelope payload was empty'
    );
  }

  return envelope.payload;
}


export const stopSimulation = async () => {
  try {
    return await apiPost<SimulationResponse>('/simulation/stop');
  } finally {
    closeSimulationWS();
  }
};

export const pauseSimulation = () =>
  apiPost<SimulationResponse>('/simulation/pause');

export const resumeSimulation = () =>
  apiPost<SimulationResponse>('/simulation/resume');