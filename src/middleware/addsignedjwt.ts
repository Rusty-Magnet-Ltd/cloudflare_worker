import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import type { JwtEnv } from "../types/api";
import { Context, Next } from "hono";
import { env } from "hono/adapter";

export async function addSignedJwt(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);

  const payload: JWTPayload = {
    sub: "Bob",
    role: "admin",
    department: "hr",
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
  };

  const token = sign(payload, SECRET_KEY, "HS256");
  ctx.res.headers.set(SECURITY_HEADER_NAME, await token);

  await next();
}
