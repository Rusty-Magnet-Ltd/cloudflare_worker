import { Hono } from "hono";
import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const generate = new Hono<{ Bindings: Bindings }>();

generate.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

export async function signPayload(payload: JWTPayload, secret: string) {
  return await sign(payload, secret, "HS256");
}

generate.use("/generate", async (c, next) => {
  await next();
  const payload: JWTPayload = {
    sub: "Bob",
    role: "admin",
    department: "hr",
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expires in 5 minutes
  };
  const token = signPayload(payload, c.env.SECRET_KEY);
  c.res.headers.set(c.env.SECURITY_HEADER_NAME, await token);
});

generate.get("/generate", (c) => {
  return c.body("thanks for visiting", 201, {
    "Content-Type": "text/plain"
  });
});

export default generate;
