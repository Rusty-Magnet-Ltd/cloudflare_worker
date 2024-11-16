import { Redis } from "@upstash/redis/cloudflare";
import { Context, Next } from "hono";
import { env } from "hono/adapter";
import {Ratelimit} from "@upstash/ratelimit";
import type { Env } from "../types/api";

export async function rateLimitMiddleware(ctx: Context, next: Next) {
  const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = env<Env>(ctx);

  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN
  });

  console.log("[*] TRIGGERS ");

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 s"),
    analytics: true
  });

  const ip = ctx.req.header("CF-Connecting-IP") || "127.0.0.1";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return ctx.json({ error: "Rate limit exceeded" }, 429);
  }

  ctx.header("X-RateLimit-Limit", limit.toString());
  ctx.header("X-RateLimit-Remaining", remaining.toString());
  ctx.header("X-RateLimit-Reset", reset.toString());

  await next();
}
