import { Hono } from "hono";
import type { Env } from "../types/api";
import { rateLimitMiddleware } from "../middleware/ratelimit";

const expensive = new Hono<{ Bindings: Env }>();

expensive.get("/expensive", rateLimitMiddleware, async (c) => {
  return c.body("Phew, you didn't get Rate Limited", 200, {
    "Content-Type": "text/plain"
  });
});

export default expensive;
