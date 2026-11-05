// The waiting room's rules, kept apart from the Durable Object so tests can drive the clock.
// A visitor is a ticket: a random ID that the Worker keeps in a cookie.

// How the room is run. Cloudflare's Waiting Room calls these "total active users" and
// "session duration", with one difference: a visitor's time inside starts when they're let
// in, and visiting again doesn't renew it. The queue then moves at a known pace, so the
// wait estimate holds.
export interface Rules {
  capacity: number;
  staySeconds: number;
}

// The waiting page reloads at least this often to ask whether it's the visitor's turn
export const REFRESH_SECONDS = 5;
// A queued visitor who hasn't asked for this long has gone, and loses their place
export const GIVE_UP_SECONDS = 20;
// Past this many waiting, new visitors are turned away rather than queued
export const MAX_QUEUE = 1000;

export type Visit =
  | { status: "admitted"; capacity: number; secondsLeft: number }
  | { status: "queued"; position: number; waiting: number; waitSeconds: number }
  | { status: "full"; waiting: number };

export type Queued = Extract<Visit, { status: "queued" }>;

export class Room {
  // ticket -> when its time inside is up
  private inside = new Map<string, number>();
  // ticket -> when it last asked. A Map keeps arrival order, and set() on an existing
  // ticket keeps its place.
  private queue = new Map<string, number>();

  visit(ticket: string, now: number, rules: Rules): Visit {
    this.tidy(now);
    const admitted = (leavesAt: number): Visit => ({
      status: "admitted",
      capacity: rules.capacity,
      secondsLeft: Math.ceil((leavesAt - now) / 1000)
    });

    const leavesAt = this.inside.get(ticket);
    if (leavesAt !== undefined) return admitted(leavesAt);

    if (!this.queue.has(ticket) && this.queue.size >= MAX_QUEUE) return { status: "full", waiting: this.queue.size };
    this.queue.set(ticket, now);

    // First come, first served: a free slot goes to whoever is nearest the front, so
    // reloading more often doesn't jump the queue
    const position = [...this.queue.keys()].indexOf(ticket);
    if (position < rules.capacity - this.inside.size) {
      this.queue.delete(ticket);
      const until = now + rules.staySeconds * 1000;
      this.inside.set(ticket, until);
      return admitted(until);
    }
    return { status: "queued", position: position + 1, waiting: this.queue.size, waitSeconds: this.waitSeconds(position, now, rules) };
  }

  // Visitors whose time is up have left, and so have queued visitors who stopped asking
  private tidy(now: number) {
    for (const [ticket, leavesAt] of this.inside) if (leavesAt <= now) this.inside.delete(ticket);
    for (const [ticket, asked] of this.queue) if (now - asked > GIVE_UP_SECONDS * 1000) this.queue.delete(ticket);
  }

  // How long the visitor at `position` (from 0) waits, if everyone ahead keeps asking:
  // each of them takes the next slot to come free, and keeps it for a stay
  private waitSeconds(position: number, now: number, rules: Rules) {
    const stay = rules.staySeconds * 1000;
    const leaving = [...this.inside.values()].sort((a, b) => a - b);
    // When each slot next comes free, soonest first: empty ones now. If the capacity went
    // down, more visitors are inside than there are slots, and only the last ones out free
    // a slot.
    const freeAt = [...new Array<number>(Math.max(0, rules.capacity - leaving.length)).fill(now), ...leaving].slice(-rules.capacity);
    for (let ahead = 0; ahead < position; ahead++) {
      const next = (freeAt.shift() ?? now) + stay;
      let i = freeAt.length;
      while (i > 0 && freeAt[i - 1] > next) i--;
      freeAt.splice(i, 0, next);
    }
    return Math.max(0, Math.ceil(((freeAt[0] ?? now) - now) / 1000));
  }
}
