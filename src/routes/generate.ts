import { Hono } from "hono";
import { addSignedJwtMiddleware } from "../middleware/addsignedjwt";
import {JwtEnv} from "../types/jwt";

const generate = new Hono<{ Bindings: JwtEnv }>();

generate.get("/generate", addSignedJwtMiddleware, (c) => {
  return c.body("thanks for visiting", 201, {
    "Content-Type": "text/plain"
  });
});

export default generate;
