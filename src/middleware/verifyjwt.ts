import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import {JwtEnv} from "../types/jwt";

export async function VerifyPayload(payload: string, secret: string, signing_alg: SignatureAlgorithm) {
  return await verify(
    payload,
    secret,
    signing_alg
  );
}

export async function verifyJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME, SIGNING_ALGORITHM } = env<JwtEnv>(ctx);
  const jwtToVerify = ctx.req.header(SECURITY_HEADER_NAME.toLowerCase());
  if (!jwtToVerify || jwtToVerify === "") {
    return ctx.text("jwt header required", 400);
  }

  try {
    await VerifyPayload(jwtToVerify, SECRET_KEY, SIGNING_ALGORITHM);
  } catch (error) {
    console.log(`[!]verify JWT failed ` + error);
    return ctx.text("jwt verify failed", 401);
  }
  await next();
}
