import { expect, it, assert, describe } from "vitest";
import { NewPayload } from "../src/model/payload";
import { JWTPayload } from "hono/utils/jwt/types";

describe("test new JWT Payloads ", () => {
  it("Issue Date of JWT set to value lower than Expiry Date", () => {
    const jwt: JWTPayload = NewPayload("foo");
    if (jwt.iat && jwt.exp) {
      expect.soft(jwt.iat).toBeLessThan(jwt.exp);
    } else {
      assert.fail("iat of exp were not defined");
    }
  });
});
