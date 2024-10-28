import { Hono } from "hono";
import { env } from "hono/adapter";
import { Style } from "hono/css";
import {
  headerClass
} from "../constants/css";

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
    <html>
      <head>
        <Style />
        <header className={headerClass}>Carpark</header>
      </head>
      <body>
        <br />
        <br />
        <img
          src="charizard.png"
          alt="Pokemon's Charizard"
          width="360"
          height="230"
        />
      </body>
      <footer></footer>
    </html>
  );
});

export default carpark;
