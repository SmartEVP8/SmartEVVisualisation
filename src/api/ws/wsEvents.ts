import { type Envelope } from "../generated/api_pb.ts";

type EnvelopePayload = Exclude<Envelope["payload"], { case: undefined; value?: undefined }>;

type PayloadMap = {
  [P in EnvelopePayload as P["case"]]: P["value"];
};

type RequestCase = "getStationSnapshot";

export type ResponseCase = Exclude<keyof PayloadMap, RequestCase>;

class SimulationEmitter extends EventTarget {
  emit<K extends ResponseCase>(event: K, value: PayloadMap[K]) {
    this.dispatchEvent(Object.assign(new Event(event), { value }));
  }

  on<K extends ResponseCase>(
    event: K,
    handler: (value: PayloadMap[K]) => void
  ): () => void {
    const wrapped = (e: Event) => {
      handler((e as Event & { value: PayloadMap[K] }).value);
    };
    this.addEventListener(event, wrapped);
    return () => this.removeEventListener(event, wrapped);
  }
}

export const simulationEvents = new SimulationEmitter();
