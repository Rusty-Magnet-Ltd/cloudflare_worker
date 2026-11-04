import { Hono } from "hono";
import { guardBody } from "../middleware/guardbody";
import type { ShieldAppEnv } from "../types/shield";

// /stopdos shields fragile-origin, a service with no DoS protection of its own.
// The origin has no public route; this binding is the only way in.
const stopDos = new Hono<ShieldAppEnv>();
const paths = ["/stopdos", "/stopdos/*"];

// GETs (the form, the good page) pass straight through
stopDos.on("GET", paths, (c) => c.env.ORIGIN.fetch(new Request(c.req.raw, { redirect: "manual" })));

// POSTs reach the origin only as a checked, buffered copy
stopDos.on("POST", paths, guardBody(), (c) => {
  const headers = new Headers(c.req.raw.headers);
  headers.delete("content-length"); // the runtime frames the buffered copy itself
  headers.delete("transfer-encoding");
  return c.env.ORIGIN.fetch(c.req.url, {
    method: "POST",
    headers,
    body: c.get("body"),
    redirect: "manual" // pass the origin's 303 to the browser rather than following it here
  });
});

export default stopDos;
