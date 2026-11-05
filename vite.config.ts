import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: { configPath: "./wrangler.toml", environment: "testing" },
        miniflare: {
          // [env.testing] binds ORIGIN to fragile-origin, and the pool won't start unless a
          // worker by that name exists. The /stopdos tests inject their own ORIGIN, and
          // test/origin.test.ts tests the real origin directly.
          workers: [
            {
              name: "fragile-origin",
              modules: true,
              compatibilityDate: "2024-08-15",
              script: "export default { fetch: () => new Response('test stub: inject ORIGIN', { status: 501 }) };"
            }
          ]
        }
      }
    }
  }
});
