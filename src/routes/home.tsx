import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { checkForFooHeaders, type FooHeader } from "../model/foo-headers";
import { routes, type RouteInfo } from "../constants";
import { page, SOURCE_URL } from "../views/page";

const home = new Hono();

// The visitor's request as the Worker saw it, foo-* headers included
const RequestCard: FC<{ line: string; host: string; foos: FooHeader[] }> = ({ line, host, foos }) => (
  <figure class="request">
    <figcaption>Your request, as this Worker received it</figcaption>
    <pre>
      <code>
        <span class="req-line">{line}</span>
        {"\n"}
        <span class="hdr">host</span>
        {": "}
        {host}
        {"\n"}
        {foos.length > 0 ? (
          foos.map((fh) => (
            <>
              <span class="hdr hdr-foo">{fh.name}</span>
              {": "}
              {fh.value}
              {"\n"}
            </>
          ))
        ) : (
          <span class="req-note"># no foo-* headers on this request</span>
        )}
      </code>
    </pre>
    <p class="request-foot">
      A Cloudflare Transform Rule adds the <code>foo-*</code> headers before the Worker runs.
    </p>
  </figure>
);

const RouteCard: FC<{ route: RouteInfo; origin: string }> = ({ route, origin }) => (
  <li class="route">
    <div class="route-head">
      <span class="methods">
        {route.methods.map((m) => (
          <span class={m === "POST" ? "method method-post" : "method"}>{m}</span>
        ))}
      </span>
      <h3 class="route-path">{route.path}</h3>
    </div>
    <p>{route.summary}</p>
    {route.open && (
      <p class="route-foot">
        <a class="route-link" href={route.path}>
          {route.open} <span aria-hidden="true">&rarr;</span>
        </a>
      </p>
    )}
    {route.example && (
      <div class="route-foot">
        <pre class="cmd">
          <code>{route.example.replace("{origin}", origin)}</code>
        </pre>
      </div>
    )}
  </li>
);

home.get("/", (c) => {
  const url = new URL(c.req.url);
  const cf = c.req.raw.cf as IncomingRequestCfProperties | undefined;
  const line = `${c.req.method} ${url.pathname} ${cf?.httpProtocol ?? "HTTP/1.1"}`;
  const foos = checkForFooHeaders(c.req.raw.headers);

  // The page shows the visitor's own IP address, so it must never be cached and shared
  c.header("Cache-Control", "private, no-store");

  return c.html(
    page(
      "foobar · edge security, by example",
      <>
        <section class="hero" aria-labelledby="hero-title">
          <div>
            <p class="eyebrow">Cloudflare Workers · Hono</p>
            <h1 id="hero-title">Edge security, by example.</h1>
            <p class="lead">
              Small, working examples of security patterns that run at the edge: signed tokens, a DoS
              shield, a Redis rate limit and a waiting room.
            </p>
            <p class="actions">
              <a class="button button-primary" href="#routes">See the routes</a>
              <a class="button" href={SOURCE_URL}>Source on GitHub</a>
            </p>
          </div>
          <RequestCard line={line} host={url.host} foos={foos} />
        </section>

        <section class="section" id="routes" aria-labelledby="routes-title">
          <div class="section-head">
            <h2 class="section-title" id="routes-title">Routes</h2>
          </div>
          <ul class="routes">
            {routes.map((route) => (
              <RouteCard route={route} origin={url.origin} />
            ))}
          </ul>
        </section>
      </>
    )
  );
});

export default home;
