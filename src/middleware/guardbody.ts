import type { Context, MiddlewareHandler } from "hono";
import type { ShieldAppEnv } from "../types/shield";

export const MAX_BODY_BYTES = 100; // demo-sized so it trips by hand; the production incident was at 1 MiB
const DEFAULT_DEADLINE_MS = 10_000;

// Reads a request body without trusting anything the client declared about it.
// Only a body that passes every rule reaches the handler, as c.get("body").
export function guardBody(maxBytes = MAX_BODY_BYTES): MiddlewareHandler<ShieldAppEnv> {
  return async (c, next) => {
    const header = c.req.header("content-length"); // repeated headers arrive joined: "5, 5"
    const declared = header !== undefined && /^\d+$/.test(header) ? Number(header) : null;
    const refuse = (status: Status, error: string, received: number | null = null) =>
      reject(c, status, { error, limit: maxBytes, declared, received });

    // 1. Content-Length must be one plain number: no signs, decimals, spaces or lists
    if (header !== undefined && declared === null) return refuse(400, "malformed_content_length");
    // 2. Content-Length and Transfer-Encoding together is the request-smuggling shape
    if (header !== undefined && c.req.header("transfer-encoding") !== undefined) {
      return refuse(400, "conflicting_framing");
    }
    // 3. A declared length over the cap is refused before a byte is read
    if (declared !== null && declared > maxBytes) return refuse(413, "payload_too_large");

    // 4. Count what actually arrives; stop at cap + 1, or when the deadline passes
    const deadlineMs = Number(c.env?.BODY_DEADLINE_MS) || DEFAULT_DEADLINE_MS;
    const read = await readCapped(c.req.raw.body, maxBytes, deadlineMs);
    if (read.outcome === "too_large") return refuse(413, "payload_too_large", read.received);
    if (read.outcome === "timeout") return refuse(408, "body_timeout", read.received);

    // 5. What arrived must be exactly what was declared
    if (declared !== null && read.bytes.byteLength !== declared) {
      return refuse(400, "content_length_mismatch", read.bytes.byteLength);
    }

    c.set("body", read.bytes);
    await next();
  };
}

type Status = 400 | 408 | 413;
type ReadResult =
  | { outcome: "ok"; bytes: Uint8Array }
  | { outcome: "too_large"; received: number }
  | { outcome: "timeout"; received: number };

async function readCapped(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
  deadlineMs: number
): Promise<ReadResult> {
  if (body === null) return { outcome: "ok", bytes: new Uint8Array(0) };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const deadline = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), deadlineMs);
  });
  try {
    for (;;) {
      const next = await Promise.race([reader.read(), deadline]);
      if (next === "timeout") {
        reader.cancel("body deadline passed").catch(() => {});
        return { outcome: "timeout", received };
      }
      if (next.done) break;
      received += next.value.byteLength;
      if (received > maxBytes) {
        reader.cancel("body over the cap").catch(() => {});
        return { outcome: "too_large", received };
      }
      chunks.push(next.value);
    }
  } finally {
    clearTimeout(timer);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { outcome: "ok", bytes };
}

const STATUS_TEXT: Record<Status, string> = {
  400: "Bad Request",
  408: "Request Timeout",
  413: "Payload Too Large"
};

type Rejection = { error: string; limit: number; declared: number | null; received: number | null };

// Browsers get a page they can show; everyone else gets JSON
function reject(c: Context, status: Status, detail: Rejection) {
  if ((c.req.header("accept") ?? "").includes("text/html")) {
    const title = `${status} ${STATUS_TEXT[status]}`;
    return c.html(
      `<!doctype html><title>${title}</title><h1>${title}</h1>` +
        `<p>${detail.error.replaceAll("_", " ")}. Bodies are limited to ${detail.limit} bytes.</p>`,
      status
    );
  }
  return c.json(detail, status);
}
