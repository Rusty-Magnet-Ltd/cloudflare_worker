import { describe, expect, it } from "vitest";
import app from "../src/routes";

describe("test /content length checks", () => {
  it("verify /content returns 200 ok", async () => {
    const res = await app.request("/content", {
      method: "POST",
      body: JSON.stringify({ message: "hello hono" }),
      headers: new Headers({ "Content-Type": "application/json" })
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toContain("worker_calculated");
  });
});
