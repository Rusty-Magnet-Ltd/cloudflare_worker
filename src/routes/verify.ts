import { Hono } from "hono";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import { SecurityHeaderName } from "./generate";
import { JWTPayload } from "hono/utils/jwt/types";

const vrfy = new Hono();

vrfy.get(
  "/verify",
  validator("header", async (value, c) => {
    const tokenToVerify = value[SecurityHeaderName.toLowerCase()];
    if (!tokenToVerify || tokenToVerify.length === 0) {
      return c.text("Invalid! Either no value or value not a string", 400);
    }
    try {
      const secretkey: string = c.env.SECRET_KEY;
      const decodedPayload = (await verify(
        tokenToVerify,
        secretkey,
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
        message: `Success.  Verified message wasn't tampered.`
      },
      201
    );
  }
);

export default vrfy;
