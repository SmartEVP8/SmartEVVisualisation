import { fromBinary } from '@bufbuild/protobuf';
import { EnvelopeSchema } from './generated/api_pb';
import type { InitEngineConfig, InitEngineResponse } from './types';
import { apiPostBinary } from './client';

export async function initializeSimulation(
  config: InitEngineConfig
): Promise<InitEngineResponse> {
  const data = await apiPostBinary('/init-engine', config);

  console.log(`Received response (${data.length} bytes)`);

  const envelope = fromBinary(EnvelopeSchema, data);

  if (!envelope.payload.case) {
    throw new Error('Envelope payload was empty');
  }

  if (envelope.payload.case !== 'initEngineData') {
    throw new Error(`Unexpected payload case: ${envelope.payload.case}`);
  }

  const initData = envelope.payload.value;

  console.log('Decoded initEngineData:', initData);

  return {
    stations: initData.stations.map((station) => ({
      id: station.id,
      address: station.address,
      pos: {
        lat: station.pos?.lat ?? 0,
        lon: station.pos?.lon ?? 0,
      },
    })),
    chargers: initData.chargers.map((charger) => ({
      id: charger.id,
      maxPowerKw: charger.maxPowerKw,
      stationId: charger.stationId,
      isDual: charger.isDual,
    })),
  };
}