import { Hono } from "hono";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import generate from "./generate";
import verify from "./verify";
import home from "./home";
import carpark from "./carpark";
import workflow from "./workflow";
import expensive from "./expensive";
import {rateLimitMiddleware} from "../middleware/ratelimit";

const app = new Hono();

app.use(logger());
app.use('/expensive', rateLimitMiddleware);
app.use(poweredBy());
app.notFound((c) => {
  return c.text("404 Message", 404);
});
app.onError((err, c) => {
  console.error(err);
  return c.text("500 Message", 500);
});

app.route("/", home);
app.route("/", generate);
app.route("/", verify);
app.route("/", carpark);
app.route("/", workflow);
app.route("/", expensive);

export default app;
