import { describe, expect, test, it } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";
import app from "../src/routes";

test("check JWTPayload instance ok", () => {
  const payload: JWTPayload = {
    sub: "Bob",
    role: "admin",
    department: "hr",
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
  };
  expect(payload).toBeDefined();
});

describe("test /generate route", () => {
  it("OK response expect", async () => {
    const res = await app.request("/generate");
    expect(res.status).toBe(201);
  });
});
