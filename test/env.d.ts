import type { JwtEnv } from "../src/types/jwt";
import type { ShieldEnv } from "../src/types/shield";

// Types `env` from "cloudflare:test" as the [env.testing] bindings in wrangler.toml
declare module "cloudflare:test" {
  interface ProvidedEnv extends JwtEnv, ShieldEnv {
    ENVIRONMENT: string;
  }
}
