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

  it("tells an admitted visitor how long they have, from the shield's X-Waiting-Room headers", async () => {
    const headers = { "X-Waiting-Room": "admitted", "X-Waiting-Room-Capacity": "2", "X-Waiting-Room-Seconds-Left": "1" };
    const body = await (await origin.request("/waiting-room", { headers })).text();
    expect(body).toContain("You're in.");
    expect(body).toContain("You have 1 second left. fragile-origin can only cope with 2 visitors at a time");
  });

  it("says why a visitor came straight in", async () => {
    const text = async (headers: Record<string, string>) => (await origin.request("/waiting-room", { headers })).text();
    expect(await text({ "X-Waiting-Room": "off" })).toContain("The queue is off (WAITING_ROOM_QUEUE=off)");
    expect(await text({ "X-Waiting-Room": "unavailable" })).toContain("working right now");
    expect(await text({})).toContain("come through the shield Worker");
  });

  it("ignores X-Waiting-Room numbers that aren't whole numbers", async () => {
    const headers = { "X-Waiting-Room": "admitted", "X-Waiting-Room-Capacity": "<b>2</b>", "X-Waiting-Room-Seconds-Left": "5" };
    const body = await (await origin.request("/waiting-room", { headers })).text();
    expect(body).toContain("You came straight in.");
    expect(body).not.toContain("<b>2</b>");
  });

  it("serves the form and the good page", async () => {
    const form = await origin.request("/stopdos");
    expect(await form.text()).toContain('enctype="multipart/form-data"');
    const thanks = await origin.request("/stopdos/thanks");
    expect(await thanks.text()).toContain("Thanks, your form arrived");
  });
});
