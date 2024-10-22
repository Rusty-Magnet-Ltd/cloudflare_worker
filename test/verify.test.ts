import { describe, expect, it } from "vitest";
import {
  env,
  createExecutionContext

} from "cloudflare:test";

export interface Env {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
}

describe("test cloudflare vitest plumbing", () => {
  it("check I can create an execution context", async () => {
    const ctx = createExecutionContext();
    expect(ctx).toBeDefined();
  });
  it("I can access environment vars", async () => {
    const SECURITY_HEADER_NAME = env.SECURITY_HEADER_NAME;
    console.log("Security Header:", SECURITY_HEADER_NAME);
    expect(SECURITY_HEADER_NAME).toBeDefined();
    expect(SECURITY_HEADER_NAME).toBeTruthy();
  });
});
