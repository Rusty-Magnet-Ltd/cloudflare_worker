import { describe, expect, test, it } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";
import { env } from "cloudflare:test";
import app from "../src/routes";
import {signPayload} from "../src/routes/generate";

const payload: JWTPayload = {
  sub: "Bob",
  role: "admin",
  department: "hr",
  exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
};

test("check JWTPayload instance ok", () => {
  expect(payload).toBeDefined();
});

describe("test /generate route", () => {
  it("payload signing looks ok", async () => {
    const res = await app.request("/generate", {}, env);
    expect(res.status).toBe(201);
  });

  it("OK response expect", async () => {
    const res = await app.request("/generate", {}, env);
    expect(res.status).toBe(201);
  });

  it("verify ok", async () => {
    const token = await signPayload(payload, env.SECRET_KEY);
    const req = new Request("http://localhost:8787/verify", {
      method: "GET",
      headers: {
        [env.SECURITY_HEADER_NAME]: token,
      },
    });
    const res = await app.request(req, {}, env);
    expect(res.status).toBe(201);
  });
});
