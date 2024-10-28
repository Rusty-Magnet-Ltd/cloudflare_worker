import { Hono } from "hono";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import { JWTPayload } from "hono/utils/jwt/types";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const vrfy = new Hono<{ Bindings: Bindings }>();

vrfy.get(
  "/verify",
  validator("header", async (value, c) => {
    const SECURITY_HEADER_NAME = c.env.SECURITY_HEADER_NAME;
    const tokenToVerify = value[SECURITY_HEADER_NAME.toLowerCase()];
    if (!tokenToVerify || tokenToVerify === "") {
      console.log(SECURITY_HEADER_NAME);
      return c.text("Invalid! Either no value or value not a string", 400);
    }
    try {
      const decodedPayload = (await verify(
        tokenToVerify,
        c.env.SECRET_KEY,
        "HS256"
      )) as JWTPayload;
      console.log(decodedPayload);
    } catch (error) {
      console.log(`Verify failed.`);
      if (error instanceof Error) console.error(error.message);
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
