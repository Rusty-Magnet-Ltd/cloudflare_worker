import { Hono } from "hono";
import { html } from "hono/html";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import generate from "./generate";
import verify from "./verify";
import home from "./home";
import waitingRoom from "./waitingroom";
import workflow from "./workflow";
import expensive from "./expensive";
import stopDos from "./dosbody";
import contentLen from "./content_len";
import { page } from "../views/page";

const app = new Hono();

// applies logger and poweredBy to all routes
app.use(logger());
app.use(poweredBy());

// Browsers get a page; API clients and scripts keep the plain-text 404
app.notFound((c) => {
  if ((c.req.header("accept") ?? "").includes("text/html")) {
    return c.html(
      page(
        "Not found · foobar",
        html`<section class="page" aria-labelledby="not-found-title">
      <p class="eyebrow">404</p>
      <h1 id="not-found-title">Nothing here.</h1>
      <p class="lead">There's no route at this address. The ones this Worker answers are listed on the home page.</p>
      <p class="actions"><a class="button" href="/#routes"><span aria-hidden="true">&larr;</span> All routes</a></p>
    </section>`
      ),
      404
    );
  }
  return c.text("404 Message", 404);
});
app.onError((err, c) => {
  console.error(err);
  return c.text("500 Message", 500);
});

app.route("/", home);
app.route("/", generate);
app.route("/", verify);
app.route("/", waitingRoom);
app.route("/", workflow);
app.route("/", expensive);
app.route("/", stopDos);
app.route("/", contentLen);

export default app;

// The waiting room's Durable Object class (wrangler.toml binds it as WAITING_ROOM) has to
// be exported from the Worker's main module
export { WaitingRoom } from "../waitingroom/durable";
