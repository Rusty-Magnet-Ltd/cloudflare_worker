import { expectTypeOf, test } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";
import { NewJwtPayload } from "../src/model/jwtpayload";

test("smoke type test", () => {
  expectTypeOf(1).toEqualTypeOf(2);
});

test("test JWTPayload constructor", () => {
  const testPayload = NewJwtPayload("foo");
  expectTypeOf({ a: testPayload }).toEqualTypeOf<{ a: JWTPayload }>();
});
