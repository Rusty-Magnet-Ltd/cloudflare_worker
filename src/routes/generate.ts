import { Hono } from "hono";
import type { JwtEnv } from "../types/api";
import { addSignedJwt } from "../middleware/addsignedjwt";

const generate = new Hono<{ Bindings: JwtEnv }>();

generate.get("/generate", addSignedJwt, (c) => {
  return c.body("thanks for visiting", 201, {
    "Content-Type": "text/plain"
  });
});

export default generate;
