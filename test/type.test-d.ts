import { expectTypeOf, test } from "vitest";
import { JWTPayload } from "hono/utils/jwt/types";
import { NewPayload } from "../src/model/payload";

test("smoke type test", () => {
  expectTypeOf(1).toEqualTypeOf(2);
});

test("test JWTPayload constructor", () => {
  const testPayload = NewPayload("foo");
  expectTypeOf({ a: testPayload }).toEqualTypeOf<{ a: JWTPayload }>();
});
