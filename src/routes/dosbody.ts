import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

const stopDos = new Hono();
const maxReqBytes: number = 20; // bytes

stopDos.post(
  "/stopdos",
  bodyLimit({
    maxSize: maxReqBytes,
    onError: (c) => {
      return c.text("Body request too large", 413);
    }
  }),
  async (c) => {
    const raw = await c.req.raw.text();
    return c.text("received: " + raw);
  });

export default stopDos;
