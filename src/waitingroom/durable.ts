import { DurableObject } from "cloudflare:workers";
import { Room, type Rules, type Visit } from "./room";

// The waiting room itself, one per hostname. A Durable Object has a single instance
// worldwide, so visitors at every Cloudflare location share the same count and the same
// queue.
//
// The room lives in memory. When the object restarts, after a deploy or a while with no
// visitors, it forgets everyone, and visitors who come back simply join again.
export class WaitingRoom extends DurableObject {
  private room = new Room();

  visit(ticket: string, rules: Rules): Visit {
    return this.room.visit(ticket, Date.now(), rules);
  }
}
