import { describe, expect, it } from "vitest";
import app from "../src/routes";
import {env} from "cloudflare:test";

describe("test /expensive Rate Limit route", () => {
  it("payload signing looks ok", async () => {
    const res = await app.request("/expensive", {}, env);
    expect(res.status).toBe(200);
  });
});
