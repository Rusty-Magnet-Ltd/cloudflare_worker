import { Context, Next } from "hono";
import { env } from "hono/adapter";
import type { JwtEnv } from "../types/jwt";

export async function jwtHeaderPresentCheck(ctx: Context, next: Next) {
  const { SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);
  const jwtHeader = ctx.req.header(SECURITY_HEADER_NAME.toLowerCase());
  if (jwtHeader == undefined || jwtHeader === "") {
    return ctx.text("jwt header required", 400);
  }
  await next();
}
