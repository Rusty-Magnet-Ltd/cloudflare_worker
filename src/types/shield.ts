export type ShieldEnv = {
  // Service binding to fragile-origin (origin/wrangler.toml), which has no public route
  ORIGIN: Fetcher;
  // How long a /stopdos POST body may take to arrive, in milliseconds
  BODY_DEADLINE_MS?: string;
};

// Hono env for /stopdos: guardBody() leaves the checked body in c.get("body")
export type ShieldAppEnv = { Bindings: ShieldEnv; Variables: { body: Uint8Array } };
