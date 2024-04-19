import { Hono } from "hono";
import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { SecretPayload } from "../model/payload";

export const SecurityHeaderName = "X-Header";
const secret = "mySecretKey";

const generate = new Hono();

generate.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

export async function signPayload(payload: JWTPayload) {
  return await sign(payload, secret, "HS256");
}

generate.use("/generate", async (c, next) => {
  await next();
  const payload = new SecretPayload("Bob");
  const token = signPayload(payload);
  c.res.headers.set(SecurityHeaderName, await token);
});

generate.get("/generate", (c) => {
  return c.body("thanks for visiting", 201, {
    "Content-Type": "text/plain",
  });
});

export default generate;
