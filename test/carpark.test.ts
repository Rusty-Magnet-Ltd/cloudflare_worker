import { describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import app from "../src/routes";

describe("test carpark", () => {
  it("/carpark ok", async () => {
    const res = await app.request("/carpark", {}, env);
    expect(res.status).toBe(200);
  });
});
