import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

const stopDos = new Hono();
const maxReqBytes: number = 5; // bytes. 50 * 1024 == 50kb

stopDos.post(
  "/stopdos",
  bodyLimit({
    maxSize: maxReqBytes,
    onError: (c) => {
      return c.text("Body request too large", 413);
    }
  }),
  async (c) => {

    const contentLength = parseInt(c.req.raw.headers.get("content-length") || "0", 10);
    console.log("length:" + contentLength);
    return c.text("passed", 200);
  });

export default stopDos;
