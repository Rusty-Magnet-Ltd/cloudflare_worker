import { Hono } from "hono";
import type { Env } from "../types/api";

const expensive = new Hono<{ Bindings: Env }>();

expensive.get("/expensive", async (c) => {
  return c.body("Phew, you didn't get Rate Limited", 200, {
    "Content-Type": "text/plain"
  });
});

export default expensive;
