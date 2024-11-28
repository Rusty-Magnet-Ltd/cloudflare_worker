import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

const stopDos = new Hono();
const maxReqBytes: number = 5; // bytes

stopDos.post(
  "/stopdos",
  bodyLimit({
    maxSize: maxReqBytes,
    onError: (c) => {
      return c.text("Body request too large", 413);
    }
  }),
  async (c) => {
    c.text("received: " + await c.req.raw.text());
  });

export default stopDos;
