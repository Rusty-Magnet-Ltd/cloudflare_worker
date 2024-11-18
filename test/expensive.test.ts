import { describe, expect, it } from "vitest";
import app from "../src/routes";
import { env } from "cloudflare:test";

describe("test /expensive Rate Limit route", () => {
  it("one expensive request is aok", async () => {
    const res = await app.request("/expensive", {}, env);
    expect(res.status).toBe(200);
  });

  it("five expensive requests nok. Rate limit fires ok", async () => {
    const max: number = 5;
    let i = 0;

    for (i; i <= max; i++) {
      const res = await app.request("/expensive", {}, env);
      if (i == max) {
        expect(res.status).toBe(429);
      }
    }
  });
});
