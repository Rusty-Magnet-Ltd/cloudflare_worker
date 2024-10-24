import { describe, expect, it } from "vitest";
import app from "../src/routes";
import { env } from "cloudflare:test";

const mockReqWithHeaders = new Request("http://localhost:8787/", {
  method: "GET",
  headers: {
    "foo-ip": "192.168.0.1",
    "foo-asn": "12345",
    "foo-country": "NL",
    "user-agent": "foobar user agent"
  }
});

describe("test basic routes", () => {
  it("return a 200 and powered by header", async () => {
    const res = await app.request(mockReqWithHeaders);
    expect(res.status).toBe(200);
    const val = res.headers.get("x-powered-by") as string;
    expect(val.toLowerCase()).toBe("hono");
  });

  it("add foo headers to mimic Cloudflare added request headers", async () => {
    const res = await app.request(mockReqWithHeaders);
    const htmlResp = await res.text(); // doing here as one time use
    expect(htmlResp.includes("zag")).toBeFalsy();
    expect(htmlResp.includes("foo-")).toBeTruthy();
  });

  it("check 404 returns what we expect", async () => {
    const blackholeReq = new Request("http://localhost:8787/blackholesun", {
      method: "GET"
    });
    const res = await app.request(blackholeReq, {}, env);
    expect(res.status).toBe(404);
  });
});
