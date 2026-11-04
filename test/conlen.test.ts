import { describe, expect, it } from "vitest";
import app from "../src/routes";

interface ContentLenReply {
  declared: number | null;
  received: number;
  matches: boolean | null;
}

async function postContent(body: BodyInit, headers: Record<string, string>): Promise<ContentLenReply> {
  const res = await app.request("/content", {
    method: "POST",
    body,
    headers: new Headers(headers),
    duplex: "half"
  } as RequestInit);
  expect(res.status).toBe(200);
  return await res.json() as ContentLenReply;
}

describe("test /content length checks", () => {
  it("agrees with a client that declares an honest length", async () => {
    const body = JSON.stringify({ message: "hello hono" });
    const reply = await postContent(body, {
      "Content-Type": "application/json",
      "Content-Length": `${body.length}`
    });

    expect(reply.declared).toBe(body.length);
    expect(reply.received).toBe(body.length);
    expect(reply.matches).toBe(true);
  });

  it("catches a client that declares one length and sends another", async () => {
    const body = "abcdef0123456789";
    const reply = await postContent(body, {
      "Content-Type": "text/plain",
      "Content-Length": "4"
    });

    expect(reply.declared).toBe(4);
    expect(reply.received).toBe(body.length);
    expect(reply.matches).toBe(false);
  });

  // A chunked upload carries no Content-Length, so the byte count is the only
  // number available and there is nothing for it to agree or disagree with.
  it("still counts a streamed body that declares no length at all", async () => {
    const payload = "abcdefghij";
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      }
    });
    const reply = await postContent(stream, { "Content-Type": "text/plain" });

    expect(reply.declared).toBeNull();
    expect(reply.received).toBe(payload.length);
    expect(reply.matches).toBeNull();
  });

  it("reports zero for a body-less post", async () => {
    const res = await app.request("/content", { method: "POST" });
    expect(res.status).toBe(200);
    const reply = await res.json() as ContentLenReply;

    expect(reply.received).toBe(0);
  });
});
