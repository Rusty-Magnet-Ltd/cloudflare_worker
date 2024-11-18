import { expect, it, assert, describe } from "vitest";
import { NewJwtPayload } from "../src/model/jwtpayload";
import { JWTPayload } from "hono/utils/jwt/types";

describe("test new JWT Payloads ", () => {
  it("Issue Date of JWT set to value lower than Expiry Date", () => {
    const jwt: JWTPayload = NewJwtPayload("foo");
    if (jwt.iat && jwt.exp) {
      expect.soft(jwt.iat).toBeLessThan(jwt.exp);
    } else {
      assert.fail("iat of exp were not defined");
    }
  });

  it("The regular JWT Payloads will give undefined values", () => {
    const jwt: JWTPayload = {
      sub: "Bob"
    };
    expect(jwt.exp).not.toBeDefined();
    expect(jwt.iat).not.toBeDefined();
  });
});
