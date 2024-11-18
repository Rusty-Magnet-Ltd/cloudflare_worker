import { Hono } from "hono";
import { verifyJwtMiddleware } from "../middleware/verifyjwt";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const verify = new Hono<{ Bindings: Bindings }>();

verify.get("/verify", verifyJwtMiddleware, (c) => {
  c.req.valid("header");
  return c.json(
    {
      message: `Success`
    },
    200
  );
}
);

export default verify;
