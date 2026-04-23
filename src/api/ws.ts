import { dispatchWSEventAction, simulationStore } from "@/store/simulationStore.ts";
import { fromBinary } from "@bufbuild/protobuf";
import { EnvelopeSchema, type Envelope } from "./generated/api_pb";

// TODO : BASEURL SHOULD PROBABLY BE GLOBAL
const WS_URL = "ws://localhost:5000/ws/simulation";

let ws: WebSocket | null = null;

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

