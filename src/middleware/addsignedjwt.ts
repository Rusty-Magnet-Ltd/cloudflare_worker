import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import type { JwtEnv } from "../types/api";
import { Context, Next } from "hono";
import { env } from "hono/adapter";

export const employeePayload: JWTPayload = {
  sub: "Bob",
  role: "admin",
  department: "hr",
  exp: Math.floor(Date.now() / 1000) + (60 * 5), // Token expires in 5 minutes
  iat: Math.floor(Date.now() / 1000),
  nbf: Math.floor(Date.now() / 1000)
};

export async function SignPayload(p: JWTPayload, secret: string) {
  return sign(p, secret, "HS256");
}

export async function addSignedJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);
  const token = SignPayload(employeePayload, SECRET_KEY);
  ctx.res.headers.set(SECURITY_HEADER_NAME, await token);
  await next();
}
