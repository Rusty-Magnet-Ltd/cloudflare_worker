import { Hono } from "hono";
import { verifyJwtMiddleware } from "../middleware/verifyjwt";
import { jwtHeaderPresentCheck } from "../middleware/jwtheader";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const verify = new Hono<{ Bindings: Bindings }>();

verify.get("/verify",
  jwtHeaderPresentCheck,
  verifyJwtMiddleware, (c) => {
    return c.json(
      {
        message: `Success`
      },
      200
    );
  }
);

export default verify;
