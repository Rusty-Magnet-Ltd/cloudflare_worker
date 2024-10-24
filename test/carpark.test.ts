import { describe, expect, it } from "vitest";
import app from "../src/routes";

describe("test carpark", () => {
  it("/carpark ok", async () => {
    const carparkReq = new Request("/carpark", {
      method: "GET"
    });
    const res = await app.request(carparkReq);
    expect(res.status).toBe(200);
  });
});
