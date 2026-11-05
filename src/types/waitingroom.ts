import type { WaitingRoom } from "../waitingroom/durable";

export type WaitingRoomEnv = {
  // The waiting room's Durable Object (src/waitingroom/durable.ts)
  WAITING_ROOM: DurableObjectNamespace<WaitingRoom>;
  // Service binding to fragile-origin, where admitted visitors go
  ORIGIN: Fetcher;
  // How many visitors can be inside at once: a whole number from 1 to 100, default 2
  WAITING_ROOM_CAPACITY?: string;
  // How long each visitor gets inside, in seconds, from when they're let in: 1 to 3600, default 30
  WAITING_ROOM_STAY_SECONDS?: string;
  // "off" lets every visitor straight in; anything else, or unset, keeps the queue on
  WAITING_ROOM_QUEUE?: string;
};

export type WaitingRoomAppEnv = { Bindings: WaitingRoomEnv };
