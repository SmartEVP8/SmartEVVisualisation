import { dispatchWSEventAction, simulationStore } from '@/store/simulationStore';
import { startSimulationWS } from '@/api/ws';
import { fromBinary } from '@bufbuild/protobuf';
import { apiPostBinary } from './client';
import { EnvelopeSchema } from './generated/api_pb';


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

export const startSimulation = async (config: InitEngineConfig) => {
  simulationStore.set(
    dispatchWSEventAction,
    await postInitializeSimulation(config)
  );
  startSimulationWS();
};

async function postInitializeSimulation(config: InitEngineConfig) {
  const data = await apiPostBinary('/init-engine', config);

  const envelope = fromBinary(EnvelopeSchema, data);

  if (!envelope.payload.case) {
    throw new Error('Envelope payload was empty');
  }

  if (envelope.payload.case !== 'initEngineData') {
    throw new Error(`Unexpected payload case: ${envelope.payload.case}`);
  }

  return envelope.payload;
}
