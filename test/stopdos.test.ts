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
const mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

function initMockUser(user: MockUser): { name: string; language: string; id: string; bio: string; version: number } {
  user.language = "en-US";
  user.id = uuidv4();
  user.bio = mockText.repeat(5);
  user.version = Math.floor(Math.random() * 100);
  return user;
}

for (let i = 0; i < MAX; i++) {
  const mockUser = initMockUser ({ name: "foobar" });
  mockUsers.push(mockUser);
}

const mockJsonBody: string = JSON.stringify(mockUsers);

describe("test /stopdos features work as expected", () => {
  it("check dummy data ok", () => {
    expect(mockJsonBody).toBeDefined();
    expect(mockJsonBody.length).toBeGreaterThan(50 * 1024); // 50kb
  });

  it("verify /stopdos returns 413 with mock payload", async () => {
    const res = await app.request("/stopdos", {
      method: "POST",
      body: JSON.stringify({ message: "hello hono" }),
      headers: new Headers({ "Content-Type": "application/json" })
    });

    expect(await res.json()).toContain("passed");
    expect(res.status).toBe(413);
  });
});
