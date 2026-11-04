import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../src/routes";

const MiB = 1024 * 1024;
const bytesOf = (n: number) => new Uint8Array(n).fill(0x61); // n bytes of "a"
const streamOf = (chunk: Uint8Array) =>
  new ReadableStream({ start(c) { c.enqueue(chunk); c.close(); } });

type OriginCall = { method: string; path: string; headers: Headers; body: Uint8Array };

// Stands in for the ORIGIN service binding and records every request that reaches it
function stubOrigin(respond: () => Response = () => Response.json({ ok: true })) {
  const calls: OriginCall[] = [];
  const ORIGIN = {
    async fetch(input: RequestInfo | URL, init?: RequestInit) {
      const req = new Request(input, init);
      const body = new Uint8Array(await req.arrayBuffer());
      calls.push({ method: req.method, path: new URL(req.url).pathname, headers: req.headers, body });
      return respond();
    }
  } as unknown as Fetcher;
  return { ORIGIN, calls };
}

const send = (origin: ReturnType<typeof stubOrigin>, init: RequestInit, deadlineMs = "2000") =>
  app.request("/stopdos", init, { ...env, ORIGIN: origin.ORIGIN, BODY_DEADLINE_MS: deadlineMs });
const post = (body: BodyInit | null, headers: HeadersInit = {}) => ({ method: "POST", body, headers });
const withLength = (body: Uint8Array) => post(body, { "Content-Length": String(body.byteLength) });

describe("/stopdos shield: rejections never reach the origin", () => {
  it.each([
    ["with Content-Length", withLength],
    ["streamed", (b: Uint8Array) => post(streamOf(b))]
  ])("%s: exactly 1 MiB is forwarded, 1 MiB + 1 gets 413", async (_, init) => {
    const accepted = stubOrigin();
    expect((await send(accepted, init(bytesOf(MiB)))).status).toBe(200);
    expect(accepted.calls).toHaveLength(1);
    expect(accepted.calls[0].body.byteLength).toBe(MiB);

    const refused = stubOrigin();
    const res = await send(refused, init(bytesOf(MiB + 1)));
    expect(res.status).toBe(413);
    expect(refused.calls).toHaveLength(0);
  });

  it("cuts off an endless stream at the cap and cancels it", async () => {
    let cancelled = false;
    const endless = new ReadableStream({
      pull(c) { c.enqueue(bytesOf(64 * 1024)); },
      cancel() { cancelled = true; }
    });
    const origin = stubOrigin();
    const res = await send(origin, post(endless));
    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ error: "payload_too_large", received: MiB + 64 * 1024 });
    expect(cancelled).toBe(true);
    expect(origin.calls).toHaveLength(0);
  });

  it("refuses a Content-Length lower than the body", async () => {
    const origin = stubOrigin();
    const res = await send(origin, post(bytesOf(16), { "Content-Length": "4" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "content_length_mismatch", limit: MiB, declared: 4, received: 16 });
    expect(origin.calls).toHaveLength(0);
  });

  it("refuses a Content-Length higher than the body", async () => {
    const origin = stubOrigin();
    const res = await send(origin, post(bytesOf(16), { "Content-Length": "32" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "content_length_mismatch", declared: 32, received: 16 });
    expect(origin.calls).toHaveLength(0);
  });

  it.each(["abc", "-1", "1e3", "0x10", "16, 16"])("refuses a malformed Content-Length: %j", async (value) => {
    const origin = stubOrigin();
    const res = await send(origin, post(bytesOf(16), { "Content-Length": value }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "malformed_content_length" });
    expect(origin.calls).toHaveLength(0);
  });

  it("refuses two Content-Length headers", async () => {
    const origin = stubOrigin();
    const headers = new Headers([["Content-Length", "16"], ["Content-Length", "16"]]);
    const res = await send(origin, post(bytesOf(16), headers));
    expect(res.status).toBe(400);
    expect(origin.calls).toHaveLength(0);
  });

  it("refuses Content-Length together with Transfer-Encoding", async () => {
    const origin = stubOrigin();
    const res = await send(origin, post(bytesOf(16), { "Content-Length": "16", "Transfer-Encoding": "chunked" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "conflicting_framing" });
    expect(origin.calls).toHaveLength(0);
  });

  it("gives up on a body that stalls, with 408, and cancels it", async () => {
    let cancelled = false;
    const stalled = new ReadableStream({
      start(c) { c.enqueue(bytesOf(10)); }, // ...and never sends the rest
      cancel() { cancelled = true; }
    });
    const origin = stubOrigin();
    const res = await send(origin, post(stalled), "20");
    expect(res.status).toBe(408);
    expect(await res.json()).toMatchObject({ error: "body_timeout", received: 10 });
    expect(cancelled).toBe(true);
    expect(origin.calls).toHaveLength(0);
  });

  it("answers 413 as a page for browsers and as JSON for API clients", async () => {
    const big = { "Content-Length": String(2 * MiB) };
    const page = await send(stubOrigin(), post(bytesOf(2 * MiB), { ...big, Accept: "text/html" }));
    expect(page.status).toBe(413);
    expect(page.headers.get("content-type")).toContain("text/html");
    expect(await page.text()).toContain("413 Payload Too Large");

    const api = await send(stubOrigin(), post(bytesOf(2 * MiB), { ...big, Accept: "application/json" }));
    expect(api.status).toBe(413);
    expect(await api.json()).toEqual({ error: "payload_too_large", limit: MiB, declared: 2 * MiB, received: null });
  });
});

describe("/stopdos shield: what reaches the origin", () => {
  it("forwards the body intact, without the client's framing headers", async () => {
    const origin = stubOrigin();
    const body = new TextEncoder().encode("message=hello+world");
    const res = await send(origin, post(body, {
      "Content-Length": String(body.byteLength),
      "Content-Type": "application/x-www-form-urlencoded"
    }));
    expect(res.status).toBe(200);
    const [call] = origin.calls;
    expect(call.body).toEqual(body);
    expect(call.headers.get("content-type")).toBe("application/x-www-form-urlencoded");
    expect(call.headers.get("content-length")).toBeNull(); // the runtime re-frames the buffered copy
    expect(call.headers.get("transfer-encoding")).toBeNull();
  });

  it("passes the origin's 303 to the browser instead of following it", async () => {
    const origin = stubOrigin(() => new Response(null, { status: 303, headers: { Location: "/stopdos/thanks" } }));
    const res = await send(origin, post("message=hi", { Accept: "text/html" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/stopdos/thanks");
  });

  it("copes with the immutable headers a real binding response has", async () => {
    // Response.redirect() has immutable headers, like anything fetched over ORIGIN.
    // The app's poweredBy() middleware still has to be able to add its header.
    const origin = stubOrigin(() => Response.redirect("http://fragile-origin/stopdos/thanks", 303));
    const res = await send(origin, post("message=hi", { Accept: "text/html" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("x-powered-by")).toBe("Hono");
  });

  it("passes GETs straight through", async () => {
    const origin = stubOrigin(() => new Response("form page"));
    const res = await app.request("/stopdos/thanks", {}, { ...env, ORIGIN: origin.ORIGIN });
    expect(await res.text()).toBe("form page");
    expect(origin.calls).toMatchObject([{ method: "GET", path: "/stopdos/thanks" }]);
  });
});
