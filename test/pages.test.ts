import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import origin from "../origin/index";
import { routes } from "../src/constants";
import { MAX_BODY_BYTES as CAP } from "../src/middleware/guardbody";
import app from "../src/routes";

// Every HTML page, on both Workers, is built on src/views/page.ts
const SHELL = '<link rel="stylesheet" href="/site.css">';
const browser = { headers: { Accept: "text/html" } };

async function html(res: Response | Promise<Response>) {
  const r = await res;
  expect(r.headers.get("content-type")).toContain("text/html");
  const body = await r.text();
  expect(body.startsWith("<!doctype html>")).toBe(true);
  expect(body).toContain(SHELL);
  return { status: r.status, headers: r.headers, body };
}

describe("home page", () => {
  it("lists every route and is never cached", async () => {
    const { headers, body } = await html(app.request("/", {}, env));
    expect(headers.get("cache-control")).toBe("private, no-store"); // it shows the visitor's IP
    for (const route of routes) expect(body).toContain(`<h3 class="route-path">${route.path}</h3>`);
  });

  it("shows the request it received, escaped", async () => {
    const req = new Request("http://localhost/", { headers: { "foo-country": "<script>alert(1)</script>" } });
    const { body } = await html(app.request(req, {}, env));
    expect(body).toContain("foo-country");
    expect(body).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(body).not.toContain("<script>alert(1)");
  });

  it("says so when there are no foo-* headers", async () => {
    const { body } = await html(app.request("/", {}, env));
    expect(body).toContain("# no foo-* headers on this request");
  });
});

describe("other pages", () => {
  it("the waiting room: fragile-origin's page once you're in, the waiting page while you queue", async () => {
    // fragile-origin's own app stands in for the ORIGIN binding
    const ORIGIN = { fetch: (input: RequestInfo | URL, init?: RequestInit) => origin.fetch(new Request(input, init)) } as unknown as Fetcher;
    const url = `https://${crypto.randomUUID()}.test/waiting-room`; // a room of its own: there's one per hostname
    const vars = { ...env, ORIGIN, WAITING_ROOM_CAPACITY: "1" };

    const admitted = await html(app.request(url, browser, vars));
    expect(admitted.status).toBe(200);
    expect(admitted.body).toContain("You're in.");
    expect(admitted.body).toContain("You have 30 seconds left.");

    const queued = await html(app.request(url, browser, vars));
    expect(queued.status).toBe(202);
    expect(queued.body).toContain("in the queue.");
    expect(queued.body).toContain("Estimated wait");
    expect(queued.body).toContain("How it works");
  });

  it("404 is a page for browsers and plain text for everyone else", async () => {
    const page = await html(app.request("/blackholesun", browser, env));
    expect(page.status).toBe(404);
    expect(page.body).toContain("Nothing here.");

    const text = await app.request("/blackholesun", {}, env);
    expect(text.status).toBe(404);
    expect(await text.text()).toBe("404 Message");
  });

  it("the shield's refusal page explains itself and links back", async () => {
    const init = { method: "POST", body: new Uint8Array(CAP + 1), headers: { ...browser.headers, "Content-Length": String(CAP + 1) } };
    const { status, body } = await html(app.request("/stopdos", init, env)); // refused before ORIGIN is called
    expect(status).toBe(413);
    expect(body).toContain("413 Payload Too Large");
    expect(body).toContain("The body was too big.");
    expect(body).toContain('href="/stopdos"');
  });

  it("fragile-origin's form and good page", async () => {
    const form = await html(origin.request("/stopdos"));
    expect(form.body).toContain('<label for="message">');
    const thanks = await html(origin.request("/stopdos/thanks"));
    expect(thanks.body).toContain("Thanks, your form arrived");
  });
});
