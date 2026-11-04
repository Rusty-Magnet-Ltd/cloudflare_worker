import { Hono } from "hono";

const contentLen = new Hono();
const clKey = "Content-Length";

// Counted off the stream rather than buffered, so a large upload cannot push
// the Worker into its 128 MB memory ceiling just to be measured.
async function countBytes(body: ReadableStream<Uint8Array> | null): Promise<number> {
  if (!body) {
    return 0;
  }

  const reader = body.getReader();
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
  }

  return total;
}

contentLen.post(
  "/content",
  async (c) => {
    const header = c.req.header(clKey);
    const declared = header === undefined ? null : Number(header);
    const received = await countBytes(c.req.raw.body);

    return c.json({
      declared,
      received,
      // null when the client sent no Content-Length at all, which is how a
      // chunked upload arrives. There is no claim to disagree with.
      matches: declared === null ? null : declared === received
    });
  });

export default contentLen;
