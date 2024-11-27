import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

const stopDos = new Hono();

stopDos.post(
  "/stopdos",
  bodyLimit({
    maxSize: 50 * 1024, // 50kb
    onError: (c) => {
      return c.text("Body request too large", 413);
    }
  }),
  async (c) => {

    // const jsonBody = await c.req.json();
    // console.log(jsonBody);
    return c.json(JSON.stringify({ message: "passed" }), 200, {
      "Content-Type": "application/json"
    });
  });

export default stopDos;
