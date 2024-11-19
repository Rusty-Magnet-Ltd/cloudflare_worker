import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import type { JwtEnv } from "../types/api";
import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";

export async function VerifyPayload(payload: string | undefined, secret: string, signing_alg: SignatureAlgorithm) {
  return await verify(
    <string>payload,
    secret,
    signing_alg
  );
}

export async function verifyJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME, SIGNING_ALGORITHM } = env<JwtEnv>(ctx);
  // todo: remove the optional string here
  const jwtToVerify = ctx.req.header(SECURITY_HEADER_NAME.toLowerCase());
  try {
    const decodedPayload = await VerifyPayload(jwtToVerify, SECRET_KEY, SIGNING_ALGORITHM);
    console.debug(decodedPayload);
  } catch (error) {
    console.log(`[!]verify JWT failed ` + error);
    return ctx.text("jwt verify failed", 401);
  }
  await next();
}
