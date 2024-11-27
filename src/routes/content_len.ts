import { Hono } from "hono";

const contentLen = new Hono();

function returnContentLenJson(conLength: string = "Content-Length not found") {
  return JSON.stringify({ message: conLength });
}

contentLen.get(
  "/content",
  async (c) => {
    const cl = c.req.header("Content-Length");
    return c.json(returnContentLenJson(cl));
  });

export default contentLen;
