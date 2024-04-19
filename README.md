## Cloudflare Worker

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/Rusty-Magnet-Ltd/cloudflare_worker/tree/master.svg?style=svg&circle-token=442df4967153b05ea2b7b2198c127c4a393f2e7b)](https://dl.circleci.com/status-badge/redirect/gh/Rusty-Magnet-Ltd/cloudflare_worker/tree/master)

Code powers [foobar.rustymagnet.xyz](https://foobar.rustymagnet.xyz/).

## Set up

- Started on [itty-router](https://itty.dev/itty-router). But docs and testing was clearer in [Hono](https://hono.dev/guides/examples).
- Local dev uses a `.dev.vars` file as the normal `.env` file is used by the Worker set up itself.
- A [Boilerplate](https://github.com/marcosrjjunior/hono-boilerplate/tree/main/src/routes) on structuring project.
- The JWT work was based these [helpers](https://hono.dev/helpers/jwt)
- Linter is [tseslint](https://typescript-eslint.io/getting-started). I had trouble getting this working until I stripped it back using these (instructions)[https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/]
