import { expect, test } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";

test("check JWTPayload instance ok", () => {
  const payload: JWTPayload = {
    sub: "Bob",
    role: "admin",
    department: "hr",
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
  };
  expect(payload).toBeDefined();
});
