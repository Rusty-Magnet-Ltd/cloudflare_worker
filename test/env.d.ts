import type { JwtEnv } from "../src/types/jwt";

// Types `env` from "cloudflare:test" as the [env.testing.vars] bindings in wrangler.toml
declare module "cloudflare:test" {
  interface ProvidedEnv extends JwtEnv {
    ENVIRONMENT: string;
  }
}
