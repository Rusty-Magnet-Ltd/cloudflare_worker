// import { validator } from "hono/dist/types/validator";
import { verify } from "hono/jwt";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import type { JwtEnv } from "../types/api";
import { JwtTokenInvalid, JwtTokenSignatureMismatched, JwtTokenExpired } from "hono/utils/jwt/types";

export async function VerifyPayload(payload: string | undefined, secret: string) {
  return await verify(
    <string>payload,
    secret,
    "HS256"
  );
}

export async function verifyJwtMiddleware(ctx: Context, next: Next) {
  const { SECRET_KEY, SECURITY_HEADER_NAME } = env<JwtEnv>(ctx);
  const jwtToVerify = ctx.req.header(SECURITY_HEADER_NAME.toLowerCase());
  try {
    const decodedPayload = await VerifyPayload(jwtToVerify, SECRET_KEY);
    console.debug(decodedPayload);
  } catch (error) {
    console.log(`[!]verify JWT failed ` + error);

    switch (error) {
      case error instanceof JwtTokenInvalid:
        console.error("[!]invalid jwt.\n"
          + "\tSECURITY_HEADER_NAME=" + SECURITY_HEADER_NAME + "\n"
          + "\tJWT=" + jwtToVerify + "\n"
          + error
        );
        break;
      case error instanceof JwtTokenSignatureMismatched:
        console.error("[!]jwt signature not valid");
        break;
      case error instanceof JwtTokenExpired:
        console.error("[!]jwt expired");
        break;
      default:
        console.error("[!]unhandled jwt error " + "\n" + error);
        break;
    }
    return ctx.text("jwt verify failed", 401);
  }
  await next();
}
