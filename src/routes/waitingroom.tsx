import { Hono, type Context } from "hono";
import { generateCookie, getCookie } from "hono/cookie";
import { html } from "hono/html";
import { GIVE_UP_SECONDS, MAX_QUEUE, REFRESH_SECONDS, type Queued, type Rules, type Visit } from "../waitingroom/room";
import type { WaitingRoomAppEnv, WaitingRoomEnv } from "../types/waitingroom";
import { page } from "../views/page";

// /waiting-room: a waiting room in front of fragile-origin, built on a Durable Object so it
// runs on the Free plan. A few visitors at a time are let in, which means sent through to
// the origin, and everyone else queues in order.
const waitingRoom = new Hono<WaitingRoomAppEnv>();

const COOKIE = "waiting-room";
// What crypto.randomUUID() makes. Anything else in the cookie is ignored, and the visitor
// gets a new ticket.
const TICKET = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Every answer is about one visitor, so none may be cached and shared
const NO_STORE = { "Cache-Control": "private, no-store" };

// A whole number from min to max, or the default
function setting(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number(value?.trim() || NaN);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

export const rulesFrom = (env: WaitingRoomEnv): Rules => ({
  capacity: setting(env.WAITING_ROOM_CAPACITY, 2, 1, 100),
  staySeconds: setting(env.WAITING_ROOM_STAY_SECONDS, 30, 1, 3600)
});

// The off switch, for when the queue itself is the problem. WAITING_ROOM_QUEUE = "off"
// lets every visitor straight in, however many there are. Any other value, or none, keeps
// the queue on, so a typo can't turn it off.
const queueIsOff = (value: string | undefined) => value?.trim().toLowerCase() === "off";

// Sends the visitor on to fragile-origin, with what the queue decided in X-Waiting-Room
// headers. Only the Worker sets those: any the client sent are dropped first.
async function toOrigin(c: Context<WaitingRoomAppEnv>, roomHeaders: Record<string, string>, responseHeaders: Record<string, string> = NO_STORE) {
  const req = new Request(c.req.raw, { redirect: "manual" });
  for (const name of [...req.headers.keys()]) if (name.startsWith("x-waiting-room")) req.headers.delete(name);
  for (const [name, value] of Object.entries(roomHeaders)) req.headers.set(name, value);
  const upstream = await c.env.ORIGIN.fetch(req);
  const res = new Response(upstream.body, upstream); // a binding's response headers are immutable
  for (const [name, value] of Object.entries(responseHeaders)) res.headers.append(name, value);
  return res;
}

waitingRoom.get("/waiting-room", async (c) => {
  if (queueIsOff(c.env.WAITING_ROOM_QUEUE)) {
    console.warn("waiting room queue is off (WAITING_ROOM_QUEUE=off): a visitor went straight in");
    return toOrigin(c, { "X-Waiting-Room": "off" });
  }

  const cookie = getCookie(c, COOKIE);
  const ticket = cookie && TICKET.test(cookie) ? cookie : crypto.randomUUID();
  const headers: Record<string, string> = { ...NO_STORE };
  if (ticket !== cookie) {
    headers["Set-Cookie"] = generateCookie(COOKIE, ticket, {
      path: "/waiting-room",
      httpOnly: true,
      sameSite: "Lax",
      secure: new URL(c.req.url).protocol === "https:", // wrangler dev is plain http
      maxAge: 60 * 60
    });
  }

  const rules = rulesFrom(c.env);
  let visit: Visit;
  try {
    const room = c.env.WAITING_ROOM.get(c.env.WAITING_ROOM.idFromName(new URL(c.req.url).host));
    visit = await room.visit(ticket, rules);
  } catch (err) {
    // Fail open: a broken queue shouldn't keep everyone out
    console.error("waiting room unavailable, so a visitor went straight in:", err);
    return toOrigin(c, { "X-Waiting-Room": "unavailable" });
  }

  switch (visit.status) {
    case "admitted":
      return toOrigin(c, {
        "X-Waiting-Room": "admitted",
        "X-Waiting-Room-Capacity": String(visit.capacity),
        "X-Waiting-Room-Seconds-Left": String(visit.secondsLeft)
      }, headers);
    case "queued":
      return c.html(waitingPage(visit, rules), 202, headers);
    case "full":
      return c.html(fullPage, 503, { ...headers, "Retry-After": String(GIVE_UP_SECONDS) });
  }
});

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
const ORDINALS = new Intl.PluralRules("en-GB", { type: "ordinal" });
const SUFFIXES: Record<string, string> = { one: "st", two: "nd", few: "rd" };
const ordinal = (n: number) => `${n}${SUFFIXES[ORDINALS.select(n)] ?? "th"}`;

function waitFor(seconds: number) {
  if (seconds <= 0) return "Any moment";
  if (seconds < 60) return plural(seconds, "second");
  return `About ${plural(Math.ceil(seconds / 60), "minute")}`;
}

const DIAGRAM = `visitor ── GET /waiting-room ──► shield Worker ── ticket ──► WaitingRoom Durable Object
                                   │                         who's in, and the queue,
                                   │                         one per hostname
                                   │
                                   ├─► your turn ── ORIGIN binding ──► fragile-origin
                                   │
                                   └─► not yet ── 202 and this page, which
                                                  reloads until it's your turn`;

function waitingPage(visit: Queued, rules: Rules) {
  // Reload when a slot should be free, and at least every few seconds to keep your place
  const refresh = Math.min(REFRESH_SECONDS, Math.max(1, visit.waitSeconds));
  return page(
    "Waiting room · foobar",
    <section class="page" aria-labelledby="queue-title">
      <p class="eyebrow">Waiting room · fragile-origin is busy</p>
      <h1 id="queue-title">You're in the queue.</h1>
      <p class="lead">
        {`fragile-origin takes ${plural(rules.capacity, "visitor")} at a time, and each gets ${plural(rules.staySeconds, "second")} before the next in line goes in.`}
      </p>
      <dl class="facts">
        <div>
          <dt>Your place</dt>
          <dd>{`${ordinal(visit.position)} of ${visit.waiting}`}</dd>
        </div>
        <div>
          <dt>Estimated wait</dt>
          <dd>{waitFor(visit.waitSeconds)}</dd>
        </div>
      </dl>
      <p class="hint">
        {`This page reloads every few seconds to ask whether it's your turn, so keep it open. Leave it for more than ${GIVE_UP_SECONDS} seconds and you lose your place.`}
      </p>
      <h2>How it works</h2>
      <pre
        class="diagram"
        role="img"
        aria-label="Each visit goes to the shield Worker, which asks the WaitingRoom Durable Object about your ticket. When it's your turn, the request goes over the ORIGIN binding to fragile-origin. Until then, you get this page, which reloads until it's your turn."
      >
        {DIAGRAM}
      </pre>
    </section>,
    html`<meta http-equiv="refresh" content="${refresh}">`
  );
}

const fullPage = page(
  "Queue full · foobar",
  <section class="page" aria-labelledby="full-title">
    <p class="eyebrow">Waiting room · the queue is full</p>
    <h1 id="full-title">The queue is full.</h1>
    <p class="lead">{`${MAX_QUEUE} visitors are already waiting, so nobody else can join for now. Try again shortly.`}</p>
    <p class="actions">
      <a class="button button-primary" href="/waiting-room">Try again</a>
      <a class="button" href="/#routes">
        <span aria-hidden="true">&larr;</span> All routes
      </a>
    </p>
  </section>
);

export default waitingRoom;
