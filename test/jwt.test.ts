import { describe, expect, test, it } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";
import { env } from "cloudflare:test";
import app from "../src/routes";
import { SignPayload } from "../src/middleware/addsignedjwt";

const payload: JWTPayload = {
  sub: "Alice",
  role: "delivery",
  department: "post",
  exp: Math.floor(Date.now() / 1000) + 60 * 2 // Token expires in 2 minutes
};

test("check JWTPayload instance ok", () => {
  expect(payload).toBeDefined();
});

describe("test /generate route", () => {
  it("payload signing looks ok", async () => {
    const res = await app.request("/generate", {}, env);
    expect(res.status).toBe(201);
  });

  it("test /generate route provides x-header in response", async () => {
    const res = await app.request("/generate", {}, env);
    const xHeader = res.headers.get(env.SECURITY_HEADER_NAME);
    expect(xHeader).not.toBeNull();
    expect(xHeader?.length).toBeGreaterThan(1);
  });

  it("verify ok", async () => {
    const token = await SignPayload(payload, env.SECRET_KEY);
    const req = new Request("http://localhost:8787/verify", {
      method: "GET",
      headers: {
        [env.SECURITY_HEADER_NAME]: token
      }
    });
    const res = await app.request(req, {}, env);
    expect(res.status).toBe(200);
  });

  it("jwt is not a jwt ok", async () => {
    const junkJWT = "junkNotAJwt";
    const req = new Request("http://localhost:8787/verify", {
      method: "GET",
      headers: {
        [env.SECURITY_HEADER_NAME]: junkJWT
      }
    });
    const res = await app.request(req, {}, env);
    expect(res.status).toBe(401);
  });

  it("empty jwt returns a http 400", async () => {
    const req = new Request("http://localhost:8787/verify", {
      method: "GET",
      headers: {
        [env.SECURITY_HEADER_NAME]: ""
      }
    });
    const res = await app.request(req, {}, env);
    expect(res.status).toBe(400);
  });
});
