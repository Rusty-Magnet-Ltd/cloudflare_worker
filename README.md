## Cloudflare Worker

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/Rusty-Magnet-Ltd/cloudflare_worker/tree/master.svg?style=svg&circle-token=442df4967153b05ea2b7b2198c127c4a393f2e7b)](https://dl.circleci.com/status-badge/redirect/gh/Rusty-Magnet-Ltd/cloudflare_worker/tree/master)

Code powers [foobar.rustymagnet.xyz](https://foobar.rustymagnet.xyz/).

## Learnings

### Testing

Testing required `"cloudflare:test"` to access `environment variables` in tests:

```typescript
import { env } from "cloudflare:test";

it("/carpark ok", async () => {
    const res = await app.request("/carpark", {}, env);
    expect(res.status).toBe(200);
});
```

### Secrets

Local code uses a `.dev.vars` to read secret environment variables.  The normal `.env` file is used by Cloudflare code.

### Environment

Environment specific values can be set in the `wrangler.toml` file as below; these can be source controlled safely as these are overridden locally by the .devs.vars ( local tests ) and production secrets.

```yaml
[env.testing.vars]
  SECURITY_HEADER_NAME = "X-Header"
  SECRET_KEY = "dummy"
  ENVIRONMENT = "TESTING"
```

The environment setting can be fed to vitest: `wrangler: { configPath: "./wrangler.toml", environment: "testing" }`

### Deploy

> [!CAUTION]
> Ensure the correct `deploy flag` is set when uploading the Cloudflare `npx wrangler deploy -e prod`.  Get this wrong and you can override real production secrets.

Cloudflare suggest [here](https://developers.cloudflare.com/workers/wrangler/configuration/):

>treating your wrangler.toml file as the source of truth for your Worker configuration

### Debug

`console.log()` output is available.  Use the `tail` command in the cli tool.  This also outputs Cloudflare added headers like cf-ipcountry, asn, ray-id, True IP.

```shell
wrangler tail foo
```

## Set up

### Deploy code to Cloudflare Worker

```mermaid
sequenceDiagram

   participant Engineer
   participant GitHub
   participant CircleCI
   participant Cloudflare
   Engineer->>GitHub: code change
   GitHub->>CircleCI: invoke change
   CircleCI->>CircleCI: set up Cloudflare's Wranger cli tool
   CircleCI->>CircleCI: Lint and test code
   CircleCI->>Cloudflare: upload new code with Wrangler cli
```



## Design choices

- Started on [itty-router](https://itty.dev/itty-router). But docs and testing was clearer in [Hono](https://hono.dev/guides/examples).
- The app uses `Grouping` of routers to make it simple to slim down code into discrete files.  Link [here](https://hono.dev/docs/api/routing).
- Setting the `ENVIRONMENT` variable needs to be handled; a great article [here](https://www.raulmelo.me/en/blog/best-practices-for-handling-per-environment-config-js-ts-applications)
- A [Boilerplate](https://github.com/marcosrjjunior/hono-boilerplate/tree/main/src/routes) on structuring project.
- The JWT work was based these [helpers](https://hono.dev/helpers/jwt).
