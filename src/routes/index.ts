import { Hono } from "hono";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import generate from "./generate";
import verify from "./verify";
import home from "./home";
import carpark from "./carpark";

type Bindings = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger());
app.use(poweredBy());
app.notFound((c) => {
  return c.text("RM custom 404 Message", 404);
});
app.onError((err, c) => {
  console.error(err);
  return c.text("RM custom Error Message", 500);
});

app.route("/", home);
app.route("/", generate);
app.route("/", verify);
app.route("/", carpark);
export default app;
