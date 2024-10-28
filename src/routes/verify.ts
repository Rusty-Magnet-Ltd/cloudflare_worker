import { Hono } from "hono";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import { JWTPayload, JwtTokenInvalid } from "hono/utils/jwt/types";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const vrfy = new Hono<{ Bindings: Bindings }>();

vrfy.get(
  "/verify",
  validator("header", async (value, c) => {
    const SECURITY_HEADER_NAME = c.env.SECURITY_HEADER_NAME;
    const jwtToVerify = value[SECURITY_HEADER_NAME.toLowerCase()];

    try {
      const decodedPayload = (await verify(
        jwtToVerify,
        c.env.SECRET_KEY,
        "HS256"
      )) as JWTPayload;
      console.log(decodedPayload);
    } catch (error) {
      console.log(`Verify failed.`);
      if (error instanceof JwtTokenInvalid) {
        console.log("[!]Invalid JWT.\n"
          + "\tSECURITY_HEADER_NAME=" + SECURITY_HEADER_NAME + "\n"
          + "\tJWT=" + jwtToVerify
        );
      }
      return c.text("jwt verify failed", 401);
    }
  }),

  (c) => {
    c.req.valid("header");
    return c.json(
      {
        message: `Success`
      },
      201
    );
  }
);

export default vrfy;
