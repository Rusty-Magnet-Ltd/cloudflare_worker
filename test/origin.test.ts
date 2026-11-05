import { describe, expect, it } from "vitest";
import origin from "../origin/index";

// fragile-origin on its own: what anyone reaching it directly gets
describe("fragile-origin", () => {
  it("crashes on a body over 100 bytes, and takes 100", async () => {
    const res = await origin.request("/stopdos", { method: "POST", body: new Uint8Array(101) });
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("crashed (simulated)");
    const ok = await origin.request("/stopdos", { method: "POST", body: new Uint8Array(100) });
    expect(ok.status).toBe(200);
  });

  it("sends browsers to the good page after a small form", async () => {
    const res = await origin.request("/stopdos", {
      method: "POST",
      body: "message=hello",
      headers: { Accept: "text/html", "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/stopdos/thanks");
  });

  it("answers API clients with what it received", async () => {
    const res = await origin.request("/stopdos", {
      method: "POST",
      body: "abcdef",
      headers: { "Content-Length": "6" }
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, received: 6, contentLength: 6 });
  });

  it("serves the form and the good page", async () => {
    const form = await origin.request("/stopdos");
    expect(await form.text()).toContain('enctype="multipart/form-data"');
    const thanks = await origin.request("/stopdos/thanks");
    expect(await thanks.text()).toContain("Thanks, your form arrived");
  });
});
