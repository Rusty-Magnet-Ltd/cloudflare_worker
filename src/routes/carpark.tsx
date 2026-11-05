import { Hono } from "hono";
import { env } from "hono/adapter";
import { page } from "../views/page";

interface Bindings {
  ENVIRONMENT: "development" | "production";
}

const carpark = new Hono<{ Bindings: Bindings }>();

carpark.get("/carpark", (c) => {
  const { ENVIRONMENT } = env(c);
  console.log("[*]environment:", ENVIRONMENT);
  console.log("[*]request headers");
  for (const key in c.req.header()) {
    const val = c.req.header(key);
    console.log(`${key}: ${val}`);
  }
  return c.html(
    page(
      "Carpark · foobar",
      <section class="page" aria-labelledby="carpark-title">
        <p class="eyebrow">Waiting room</p>
        <h1 id="carpark-title">You're in the carpark.</h1>
        <p class="lead">
          A placeholder page for waiting-room experiments: somewhere to park visitors while a busy origin
          catches up. Nothing is queued here; the Worker answers straight away.
        </p>
        <p class="actions">
          <a class="button" href="/#routes">
            <span aria-hidden="true">&larr;</span> All routes
          </a>
        </p>
      </section>
    )
  );
});

export default carpark;
