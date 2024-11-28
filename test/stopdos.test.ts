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
      body: JSON.stringify({ hel: "lo" }),
      headers: new Headers({ "Content-Type": "application/json" })
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

  it("verify /stopdos with incorrect content-length doesn't parse entire request body ok", async () => {
    const size = 4;
    const res = await app.request("/stopdos", {
      method: "POST",
      body: "abcdef0123456789",
      headers: new Headers({
        "Content-Type": "text/plain",
        "Content-Length": `${size}`
      })
    });
    expect(res.status).toBe(200);
    const receivedText = await res.text();
    expect(receivedText.length).toEqual(size);
  });
});
