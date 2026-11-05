import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../src/routes";
import { rulesFrom } from "../src/routes/waitingroom";
import type { WaitingRoomEnv } from "../src/types/waitingroom";
import { GIVE_UP_SECONDS, MAX_QUEUE, Room, type Rules } from "../src/waitingroom/room";

const rules: Rules = { capacity: 2, staySeconds: 30 };
const one = (staySeconds: number): Rules => ({ capacity: 1, staySeconds });
const s = (seconds: number) => seconds * 1000; // the fake clock counts milliseconds

describe("the waiting room's rules", () => {
  it("lets visitors in up to the capacity, then queues the rest in order", () => {
    const room = new Room();
    expect(room.visit("a", 0, rules)).toEqual({ status: "admitted", capacity: 2, secondsLeft: 30 });
    expect(room.visit("b", 0, rules)).toEqual({ status: "admitted", capacity: 2, secondsLeft: 30 });
    expect(room.visit("c", 0, rules)).toMatchObject({ status: "queued", position: 1, waiting: 1 });
    expect(room.visit("d", 0, rules)).toMatchObject({ status: "queued", position: 2, waiting: 2 });
  });

  it("gives each visitor one stay inside, and visiting again doesn't renew it", () => {
    const room = new Room();
    room.visit("a", 0, rules);
    expect(room.visit("a", s(20), rules)).toEqual({ status: "admitted", capacity: 2, secondsLeft: 10 });
    expect(room.visit("a", s(29.5), rules)).toMatchObject({ status: "admitted", secondsLeft: 1 });
    // Time's up. With nobody waiting, the next visit starts a new stay.
    expect(room.visit("a", s(30), rules)).toMatchObject({ status: "admitted", secondsLeft: 30 });
  });

  it("lets in the front of the queue, not whoever asks first", () => {
    const room = new Room();
    room.visit("a", 0, one(10)); // inside until 10 s
    room.visit("b", s(1), one(10)); // 1st in the queue
    room.visit("c", s(2), one(10)); // 2nd
    // a's time is up. c asks before b does, and still waits: the slot is b's, for 10 s.
    expect(room.visit("c", s(11), one(10))).toEqual({ status: "queued", position: 2, waiting: 2, waitSeconds: 10 });
    expect(room.visit("b", s(12), one(10))).toMatchObject({ status: "admitted" });
    expect(room.visit("c", s(13), one(10))).toMatchObject({ status: "queued", position: 1, waiting: 1 });
  });

  it("drops a queued visitor who stops asking, and moves everyone behind them up", () => {
    const room = new Room();
    room.visit("a", 0, one(60));
    room.visit("b", s(1), one(60)); // asks once, then goes away
    room.visit("c", s(2), one(60));
    expect(room.visit("c", s(15), one(60))).toMatchObject({ position: 2 });
    expect(room.visit("c", s(1 + GIVE_UP_SECONDS + 1), one(60))).toMatchObject({ status: "queued", position: 1, waiting: 1 });
  });

  it("estimates the wait from when each slot comes free", () => {
    const single = new Room();
    single.visit("a", 0, one(30)); // leaves at 30 s
    expect(single.visit("b", 0, one(30))).toMatchObject({ waitSeconds: 30 });
    expect(single.visit("c", 0, one(30))).toMatchObject({ waitSeconds: 60 }); // after a, then b
    expect(single.visit("b", s(10), one(30))).toMatchObject({ waitSeconds: 20 });

    const double = new Room();
    double.visit("a", 0, rules); // leaves at 30 s
    double.visit("b", s(10), rules); // leaves at 40 s
    expect(double.visit("c", s(10), rules)).toMatchObject({ waitSeconds: 20 }); // a's slot
    expect(double.visit("d", s(10), rules)).toMatchObject({ waitSeconds: 30 }); // b's slot
    expect(double.visit("e", s(10), rules)).toMatchObject({ waitSeconds: 50 }); // a's slot again, after c's stay
  });

  it("waits for enough visitors to leave when the capacity goes down", () => {
    const room = new Room();
    room.visit("a", 0, rules); // leaves at 30 s
    room.visit("b", s(10), rules); // leaves at 40 s
    expect(room.visit("c", s(10), one(30))).toMatchObject({ status: "queued", waitSeconds: 30 }); // b has to leave too
    expect(room.visit("c", s(25), one(30))).toMatchObject({ status: "queued" });
    expect(room.visit("c", s(35), one(30))).toMatchObject({ status: "queued" }); // a has gone, but b fills the one slot
    expect(room.visit("c", s(40), one(30))).toMatchObject({ status: "admitted" });
  });

  it("turns new visitors away when the queue is full, and keeps everyone already in it", () => {
    const room = new Room();
    room.visit("inside", 0, one(30));
    for (let i = 0; i < MAX_QUEUE; i++) room.visit(`q${i}`, 0, one(30));
    expect(room.visit("late", 0, one(30))).toEqual({ status: "full", waiting: MAX_QUEUE });
    expect(room.visit("q0", 0, one(30))).toMatchObject({ status: "queued", position: 1 });
  });
});

describe("/waiting-room settings", () => {
  it("reads whole numbers in range", () => {
    expect(rulesFrom({ WAITING_ROOM_CAPACITY: "5", WAITING_ROOM_STAY_SECONDS: " 60 " } as WaitingRoomEnv)).toEqual({ capacity: 5, staySeconds: 60 });
  });

  it("falls back to 2 visitors for 30 seconds each", () => {
    for (const bad of [undefined, "", "0", "-1", "2.5", "lots", "101"]) {
      expect(rulesFrom({ WAITING_ROOM_CAPACITY: bad } as WaitingRoomEnv).capacity).toBe(2);
    }
    for (const bad of [undefined, "", "0", "-1", "2.5", "lots", "3601"]) {
      expect(rulesFrom({ WAITING_ROOM_STAY_SECONDS: bad } as WaitingRoomEnv).staySeconds).toBe(30);
    }
  });
});

type OriginCall = { path: string; headers: Headers };

// Stands in for the ORIGIN service binding and records every request that reaches it
function stubOrigin() {
  const calls: OriginCall[] = [];
  const ORIGIN = {
    async fetch(input: RequestInfo | URL, init?: RequestInit) {
      const req = new Request(input, init);
      calls.push({ path: new URL(req.url).pathname, headers: req.headers });
      return new Response("origin page", { headers: { "Content-Type": "text/html" } });
    }
  } as unknown as Fetcher;
  return { ORIGIN, calls };
}

// The Worker keeps one waiting room per hostname, so each test gets a room of its own
function waitingRoom(vars: Partial<WaitingRoomEnv> = {}) {
  const host = `${crypto.randomUUID()}.test`;
  const origin = stubOrigin();
  const visit = (ticket?: string, headers: Record<string, string> = {}) =>
    app.request(
      `https://${host}/waiting-room`,
      { headers: { ...(ticket ? { Cookie: `waiting-room=${ticket}` } : {}), ...headers } },
      { ...env, ORIGIN: origin.ORIGIN, ...vars }
    );
  return { visit, calls: origin.calls };
}

const ticketOf = (res: Response) => /waiting-room=([^;]+)/.exec(res.headers.get("set-cookie") ?? "")?.[1];
const roomHeaders = (headers: Headers) => Object.fromEntries([...headers].filter(([name]) => name.startsWith("x-waiting-room")));

describe("/waiting-room", () => {
  it("lets the first visitor in: the origin's page, a ticket, and the decision in X-Waiting-Room headers", async () => {
    const room = waitingRoom();
    const res = await room.visit();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("origin page");
    expect(res.headers.get("cache-control")).toBe("private, no-store");

    const cookie = res.headers.get("set-cookie") ?? "";
    expect(ticketOf(res)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    for (const part of ["Path=/waiting-room", "HttpOnly", "Secure", "SameSite=Lax", "Max-Age=3600"]) expect(cookie).toContain(part);

    expect(room.calls).toHaveLength(1);
    expect(room.calls[0].path).toBe("/waiting-room");
    expect(roomHeaders(room.calls[0].headers)).toEqual({
      "x-waiting-room": "admitted",
      "x-waiting-room-capacity": "2",
      "x-waiting-room-seconds-left": "30"
    });
  });

  it("queues visitors once it's full: a 202 waiting page that reloads itself", async () => {
    const room = waitingRoom({ WAITING_ROOM_CAPACITY: "1" });
    await room.visit();
    const res = await room.visit();
    expect(res.status).toBe(202);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const body = await res.text();
    expect(body).toContain("in the queue.");
    expect(body).toContain("1st of 1");
    expect(body).toContain("30 seconds"); // the estimated wait
    expect(body).toContain('<meta http-equiv="refresh" content="5">');
    expect(room.calls).toHaveLength(1); // only the visitor who got in reached the origin
  });

  it("keeps a queued visitor's place while they hold their ticket", async () => {
    const room = waitingRoom({ WAITING_ROOM_CAPACITY: "1" });
    await room.visit();
    const ticket = ticketOf(await room.visit());
    await room.visit(); // someone else joins behind
    const again = await room.visit(ticket);
    expect(again.status).toBe(202);
    expect(again.headers.get("set-cookie")).toBeNull(); // the same ticket, so no new cookie
    expect(await again.text()).toContain("1st of 2");
  });

  it("lets an admitted visitor back in until their time is up", async () => {
    const room = waitingRoom({ WAITING_ROOM_CAPACITY: "1" });
    const ticket = ticketOf(await room.visit());
    await room.visit(); // queued behind
    const back = await room.visit(ticket);
    expect(back.status).toBe(200);
    expect(room.calls).toHaveLength(2);
    expect(room.calls[1].headers.get("x-waiting-room")).toBe("admitted");
  });

  it("drops any X-Waiting-Room headers the client sends", async () => {
    const room = waitingRoom();
    await room.visit(undefined, { "X-Waiting-Room-Seconds-Left": "99999", "X-Waiting-Room-Vip": "yes" });
    const sent = room.calls[0].headers;
    expect(sent.get("x-waiting-room-seconds-left")).toBe("30");
    expect(sent.get("x-waiting-room-vip")).toBeNull();
  });

  it("gives a new ticket for a cookie that isn't one", async () => {
    const res = await waitingRoom().visit("not-a-ticket");
    expect(ticketOf(res)).toMatch(/^[0-9a-f]{8}-/);
  });

  it("lets visitors in if the Durable Object fails", async () => {
    const broken = {
      idFromName: () => ({}),
      get: () => ({ visit: () => Promise.reject(new Error("simulated failure")) })
    } as unknown as WaitingRoomEnv["WAITING_ROOM"];
    const room = waitingRoom({ WAITING_ROOM: broken });
    const res = await room.visit();
    expect(res.status).toBe(200);
    expect(room.calls[0].headers.get("x-waiting-room")).toBe("unavailable");
  });
});

describe("/waiting-room: the off switch", () => {
  it.each(["off", "OFF", " Off "])("WAITING_ROOM_QUEUE=%j lets everyone straight in", async (value) => {
    const room = waitingRoom({ WAITING_ROOM_QUEUE: value, WAITING_ROOM_CAPACITY: "1" });
    for (let i = 0; i < 3; i++) {
      const res = await room.visit();
      expect(res.status).toBe(200);
      expect(res.headers.get("set-cookie")).toBeNull();
    }
    expect(room.calls.map((call) => roomHeaders(call.headers))).toEqual(Array(3).fill({ "x-waiting-room": "off" }));
  });

  it.each(["on", "", "false", "0", "disabled", undefined])("WAITING_ROOM_QUEUE=%j keeps the queue on", async (value) => {
    const room = waitingRoom({ WAITING_ROOM_QUEUE: value, WAITING_ROOM_CAPACITY: "1" });
    await room.visit();
    expect((await room.visit()).status).toBe(202);
  });
});
