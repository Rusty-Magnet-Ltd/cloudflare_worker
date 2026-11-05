import { Hono, type Context, type MiddlewareHandler } from "hono";
import { guardBody } from "../middleware/guardbody";
import type { ShieldAppEnv } from "../types/shield";

// /stopdos shields fragile-origin, a service with no DoS protection of its own.
// The origin has no public route; this binding is the only way in.
const stopDos = new Hono<ShieldAppEnv>();
const paths = ["/stopdos", "/stopdos/*"];

// A binding's response has immutable headers; copy it so app middleware can add to them
const relay = (res: Response) => new Response(res.body, res);

// The request exactly as the client sent it: headers, framing and body stream
const passThrough = async (c: Context<ShieldAppEnv>) =>
  relay(await c.env.ORIGIN.fetch(new Request(c.req.raw, { redirect: "manual" })));

// The off switch, for when the shield itself is the problem. STOPDOS_SHIELD = "off"
// sends POSTs to the origin unchecked, as if the shield weren't there. Any other
// value, or none, leaves it on, so a typo can't turn it off by accident.
const shieldIsOff = (setting: string | undefined) => setting?.trim().toLowerCase() === "off";

const unlessShieldOff: MiddlewareHandler<ShieldAppEnv> = async (c, next) => {
  if (!shieldIsOff(c.env.STOPDOS_SHIELD)) return next();
  console.warn(`stopdos shield is off (STOPDOS_SHIELD=off): ${c.req.method} ${c.req.path} forwarded unchecked`);
  return passThrough(c);
};

// GETs (the form, the good page) pass straight through
stopDos.on("GET", paths, passThrough);

// POSTs reach the origin only as a checked, buffered copy
stopDos.on("POST", paths, unlessShieldOff, guardBody(), async (c) => {
  const headers = new Headers(c.req.raw.headers);
  headers.delete("content-length"); // the runtime frames the buffered copy itself
  headers.delete("transfer-encoding");
  return relay(await c.env.ORIGIN.fetch(c.req.url, {
    method: "POST",
    headers,
    body: c.get("body"),
    redirect: "manual" // pass the origin's 303 to the browser rather than following it here
  }));
});

export default stopDos;
