import { describe, expect, it } from "vitest";
import app from "../src/routes";
import { v4 as uuidv4 } from "uuid";

interface MockUser {
  name: string;
  language?: string;
  id?: string;
  bio?: string;
  version?: number;
}

const MAX = 150;
const mockUsers = Array<MockUser>();
const mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function initMockUser(user: MockUser): { name: string; language: string; id: string; bio: string; version: number } {
  return {
    name: user.name,
    language: user.language || "US/EN",
    id: uuidv4(),
    bio: mockText.repeat(5),
    version: Math.floor(Math.random() * 100)
  };
}

for (let i = 0; i < MAX; i++) {
  const mockUser = initMockUser ({ name: "foobar" });
  mockUsers.push(mockUser);
}

const mockJsonBody: string = JSON.stringify(mockUsers);

describe("test /stopdos features work as expected", () => {
  it("check mock data ok", () => {
    expect(mockJsonBody).toBeDefined();
    expect(mockJsonBody.length).toBeGreaterThan(50 * 1024); // 50kb
  });
  it("check mock data can parse json string to object ok", () => {
    JSON.parse(mockJsonBody);
  });

  it("verify /stopdos returns 200 ok", async () => {
    const res = await app.request("/stopdos", {
      method: "POST",
      body: "abcdef",
      headers: new Headers({ "Content-Type": "text/plain" })
    });
    expect(res.status).toBe(200);
    console.log(await res.text());
  });

  it("verify /stopdos returns 413 ok", async () => {
    const res = await app.request("/stopdos", {
      method: "POST",
      body: JSON.stringify({ hel: "lo world" }),
      headers: new Headers({ "Content-Type": "application/json" })
    });
    expect(res.status).toBe(413);
    console.log(await res.text());
  });

  it("verify /stopdos 413 with plaintext request ok", async () => {
    const res = await app.request("/stopdos", {
      method: "POST",
      body: "abcdef0123456789",
      headers: new Headers({ "Content-Type": "text/plain" })
    });
    expect(res.status).toBe(413);
    console.log(await res.text());
  });
});

const enc = new TextEncoder();
const asStream = (s: string) =>
  new ReadableStream({ start(c) { c.enqueue(enc.encode(s)); c.close(); } });
const post = (body: BodyInit | null, headers?: HeadersInit) =>
  app.request("/stopdos", { method: "POST", body, headers });

const limitCases = [
  { label: "10 bytes", body: "abcdefghij", status: 200 },
  { label: "11 bytes", body: "abcdefghijk", status: 413 },
  { label: "6 chars / 12 bytes", body: "éééééé", status: 413 },
];

describe("/stopdos 10-byte limit", () => {
  // Content-Length present: bodyLimit decides from the header alone
  it.each(limitCases)("with Content-Length, $label -> $status", async ({ body, status }) => {
    const res = await post(body, { "Content-Length": String(enc.encode(body).length) });
    expect(res.status).toBe(status);
  });

  // No Content-Length: bodyLimit counts bytes as the handler reads them
  it.each(limitCases)("streamed, $label -> $status", async ({ body, status }) => {
    expect((await post(asStream(body))).status).toBe(status);
  });

  it("accepts an empty POST", async () => {
    expect((await post(null)).status).toBe(200);
  });

  // No case for a Content-Length that disagrees with the body: app.request() has no HTTP
  // framing, so only an in-process request can carry one. Over a socket the header frames
  // the body: curl -H 'Content-Length: 4' --data-binary abcdef0123456789 echoes "abcd".
});
