import { dispatchWSEventAction, simulationStore } from '@/store/simulationStore';
import { startSimulationWS } from '@/api/ws';
import { fromBinary } from '@bufbuild/protobuf';
import { apiPost, apiPostBinary } from './client';
import { EnvelopeSchema } from './generated/protocol/api_pb';

export type InitEngineConfig = {
  maximumEVs: number;
  seed: number;
  dualChargerProbability: number;
  numberOfChargers: number;
  costWeights: {
    costId: number;
    value: number;
  }[];
};

export type SimulationResponse = {
  message: string;
};


export const startSimulation = async (config: InitEngineConfig) => {
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


export const stopSimulation = () =>
  apiPost<SimulationResponse>('/simulation/stop');

export const pauseSimulation = () =>
  apiPost<SimulationResponse>('/simulation/pause');

export const resumeSimulation = () =>
  apiPost<SimulationResponse>('/simulation/resume');