import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import type { JwtEnv } from "../types/api";

export async function VerifyPayload(payload: string | undefined, secret: string) {
  return await verify(
    <string>payload,
    secret,
    "HS256"
  );
}

export async function verifyJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);
  // todo: remove the request get here
  const jwtToVerify = ctx.req.header(SECURITY_HEADER_NAME.toLowerCase());
  try {
    console.log("JWT CHECK");
    const decodedPayload = await VerifyPayload(jwtToVerify, SECRET_KEY);
    console.debug(decodedPayload);
  } catch (error) {
    console.log(`[!]verify JWT failed ` + error);
    return ctx.text("jwt verify failed", 401);
  }
  await next();
}
