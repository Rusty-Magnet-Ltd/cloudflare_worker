import { Hono } from "hono";

const contentLen = new Hono();
const clKey = "Content-Length";

function returnContentLenJson(conLength: string = `${clKey} not found`) {
  return JSON.stringify({ worker_calculated: `length of: ${conLength}` });
}

contentLen.post(
  "/content",
  async (c) => {
    const cl = c.req.header(clKey);
    return c.json(returnContentLenJson(cl));
  });

export default contentLen;
