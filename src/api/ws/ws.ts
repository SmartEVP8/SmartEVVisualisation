import { EnvelopeSchema, type Envelope } from "../generated/api_pb.ts";
import { GetStationSnapshotSchema } from "../generated/api_pb.ts";
import { fromBinary, toBinary, create } from "@bufbuild/protobuf";
import { simulationEvents } from "./wsEvents.ts";

// TODO : BASEURL SHOULD PROBABLY BE GLOBAL
const WS_URL = "ws://localhost:5000/ws/simulation";

let ws: WebSocket | null = null;

export function sendGetStationSnapshot() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WS not open, cannot send getStationSnapshot");
    return;
  }

  const envelope = create(EnvelopeSchema, {
    payload: {
      case: "getStationSnapshot",
      value: create(GetStationSnapshotSchema, {}),
    },
  });

  ws.send(toBinary(EnvelopeSchema, envelope));
}

function handleMessage(payload: Exclude<Envelope["payload"], { case: undefined }>) {
  switch (payload.case) {
    case "arrival":
      simulationEvents.emit("arrival", payload.value);
      break;
    case "chargingEnd":
      simulationEvents.emit("chargingEnd", payload.value);
      break;
    case "stateUpdate":
      simulationEvents.emit("stateUpdate", payload.value);
      break;
    case "stationStateResponse":
      simulationEvents.emit("stationStateResponse", payload.value);
      break;
    case "initEngineData":
      simulationEvents.emit("initEngineData", payload.value);
      break;
    case "getStationSnapshot":
      throw Error("This should never happen")
  }
}

// TODO : MOVE THESE WHERE EVER WE NEED AND UPDATE STATE APPROPRIATELY
simulationEvents.on("chargingEnd", (value) => {
  console.log("EV Done charging", value);
});

simulationEvents.on("stationStateResponse", (value) => {
  console.log("Got station state", value);
});

simulationEvents.on("stateUpdate", (value) => {
  console.log("Simulation state", value);
});

simulationEvents.on("arrival", (value) => {
  console.log("Got arrival", value);
});


export function startSimulationWS(): WebSocket {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("WS connected");
  };

  ws.onmessage = async (event: MessageEvent) => {
    try {
      let buffer: Uint8Array;
      if (event.data instanceof Blob) {
        buffer = new Uint8Array(await event.data.arrayBuffer());
      } else if (event.data instanceof ArrayBuffer) {
        buffer = new Uint8Array(event.data);
      } else {
        console.warn("Unknown WS message type", event.data);
        return;
      }

      const envelope = fromBinary(EnvelopeSchema, buffer);
      if (!envelope.payload.case) return;

      handleMessage(envelope.payload as Exclude<Envelope["payload"], { case: undefined }>);
    } catch (err) {
      console.error("Failed to parse WS message:", err);
    }
  };

  ws.onerror = (err) => console.error("WS error:", err);
  ws.onclose = ({ code, reason }) =>
    console.log(`WS closed (code: ${code}, reason: ${reason})`);

  return ws;
}

export function closeSimulationWS() {
  ws?.close();
  ws = null;
}
