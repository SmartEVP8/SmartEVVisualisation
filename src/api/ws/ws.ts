import { dispatchWSEventAction, simulationStore } from "@/store/simulationStore.ts";
import { EnvelopeSchema, type Envelope } from "../generated/api_pb.ts";
import { GetStationSnapshotSchema } from "../generated/api_pb.ts";
import { fromBinary, toBinary, create } from "@bufbuild/protobuf";

// TODO : BASEURL SHOULD PROBABLY BE GLOBAL
const WS_URL = "ws://localhost:5000/ws/simulation";

let ws: WebSocket | null = null;

export function sendGetStationSnapshot(stationId: number) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WS not open, cannot send getStationSnapshot");
    return;
  }

  const envelope = create(EnvelopeSchema, {
    payload: {
      case: "getStationSnapshot",
      value: create(GetStationSnapshotSchema, { stationId: stationId }),
    },
  });

  ws.send(toBinary(EnvelopeSchema, envelope));
}

export function startSimulationWS(): WebSocket {
  ws = new WebSocket(WS_URL);

  ws.onerror = (err) => console.error("WS error:", err);

  ws.onclose = ({ code, reason }) =>
    console.log(`WS closed (code: ${code}, reason: ${reason})`);

  ws.onopen = () => console.log("WS connected");

  ws.onmessage = async (event: MessageEvent) => {
    try {
      let buffer: Uint8Array = event.data instanceof Blob
        ? new Uint8Array(await event.data.arrayBuffer())
        : new Uint8Array(event.data);

      const envelope = fromBinary(EnvelopeSchema, buffer);

      if (envelope.payload.case) {
        simulationStore.set(
          dispatchWSEventAction,
          envelope.payload as Exclude<Envelope["payload"], { case: undefined }>
        );

        if (envelope.payload.case === "arrival" || envelope.payload.case === "chargingEnd") {
          sendGetStationSnapshot(envelope.payload.value.stationId);
        }
      }
    } catch (err) {
      console.error("Failed to parse WS message:", err);
    }
  };

  return ws;
}

export function closeSimulationWS() {
  ws?.close();
  ws = null;
}
