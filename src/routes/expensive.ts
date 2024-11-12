import { Hono } from "hono";

const expensive = new Hono();

expensive.get("/expensive", (c) => {
  return c.body("Phew, you didn't get Rate Limited", 200, {
    "Content-Type": "text/plain"
  });
});

export default expensive;
