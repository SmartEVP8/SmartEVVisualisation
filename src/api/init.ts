import { fromBinary } from '@bufbuild/protobuf';
import { EnvelopeSchema } from './generated/api_pb';
import type { InitEngineConfig, InitEngineResponse } from './types';

export async function initializeSimulation(
  config: InitEngineConfig
): Promise<InitEngineResponse> {
  const response = await fetch('http://localhost:5000/init-engine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Init failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

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