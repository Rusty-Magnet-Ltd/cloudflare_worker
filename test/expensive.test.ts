import { describe, expect, it } from "vitest";
import app from "../src/routes";
import { env } from "cloudflare:test";

describe.skip("test /expensive Rate Limit route", () => {
  it("one expensive request is aok", async () => {
    const res = await app.request("/expensive", {}, env);
    expect(res.status).toBe(200);
  });

  it("skipped -> five expensive requests nok. Rate limit fires ok", async () => {
    const max: number = 5;
    const responseCodes = new Array(max) as Array<number>;
    let i = 0;

    for (i; i <= max; i++) {
      const res = await app.request("/expensive", {}, env);
      responseCodes[i] = res.status;
    }
    const rateLimited = responseCodes.includes(429);
    expect(rateLimited).toBeTruthy();
  }, 70 * 1000); // 7 seconds
});
