import { fromBinary } from '@bufbuild/protobuf';
import { apiGetBinary } from './client';
import { EnvelopeSchema } from './generated/api_pb';
import type { Position } from '@/store/simulationStore';

export type EVPosition = {
  id: number;
  position: Position;
};


export async function getEVs(southWest: Position, northEast: Position): Promise<EVPosition[]> {
  const data = await apiGetBinary(
    `/simulation/${southWest.lat}, ${southWest.lon}, ${northEast.lat}, ${northEast.lon}`
  );
  const envelope = fromBinary(EnvelopeSchema, data);

  if (envelope.payload.case !== 'getEvsInViewport') return [];

  return envelope.payload.value.evPositions.map((ev) => ({
    id: ev.evId,
    position: { lat: ev.pos!.lat, lon: ev.pos!.lon },
  }));
}
