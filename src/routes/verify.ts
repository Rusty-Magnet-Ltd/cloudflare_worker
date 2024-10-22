import { Hono } from "hono";
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import { JWTPayload } from "hono/utils/jwt/types";
import { env } from "hono/adapter";

const vrfy = new Hono();

vrfy.get(
  "/verify",
  validator("header", async (value, c) => {
    const { SECURITY_HEADER_NAME } = env<{ SECURITY_HEADER_NAME: string }>(
      c,
      "workerd"
    );
    const tokenToVerify = value[SECURITY_HEADER_NAME.toLowerCase()];
    if (!tokenToVerify || tokenToVerify.length === 0) {
      return c.text("Invalid! Either no value or value not a string", 400);
    }
    try {
      const { SECRET_KEY } = env<{ SECRET_KEY: string }>(c, "workerd");
      const decodedPayload = (await verify(
        tokenToVerify,
        SECRET_KEY,
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
