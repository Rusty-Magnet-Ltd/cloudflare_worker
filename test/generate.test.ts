import { describe, expect, it, test } from "vitest";
import app from "../src/routes";
import { SecurityHeaderName } from "../src/routes/generate";
import { JWTPayload } from "hono/utils/jwt/types";

describe("test a call to /generate returns a Header called `X-Header`", () => {
  it("return a 201", async () => {
    const res = await app.request("/generate");
    expect(res.status).toBe(201);
    expect(res.headers.get(SecurityHeaderName)).toBeDefined();
  });
});

test("check JWTPayload instance ok", () => {
  const payload: JWTPayload = {
    sub: "Bob",
    role: "admin",
    department: "hr",
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
  };
  expect(payload).toBeDefined();
});
