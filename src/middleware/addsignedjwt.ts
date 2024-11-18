import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import type { JwtEnv } from "../types/api";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import { employeePayload } from "../constants/jwtemployee";

export async function SignPayload(p: JWTPayload, secret: string) {
  console.log("Payload for signing:\n", p);
  return sign(p, secret, "HS256");
}

export async function addSignedJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);
  const payload = employeePayload;
  const token = await SignPayload(payload, SECRET_KEY);
  ctx.res.headers.set(SECURITY_HEADER_NAME, token);
  await next();
}
