import { Hono } from "hono";
import { logger } from "hono/logger";

const carpark = new Hono();

export const customLogger = (message: string, headers: Record<string, string>) => {
  for (const key in headers) {
    const data = headers[key];
    console.log(`${key}: ${data}`);
  }
};

carpark.use(logger(customLogger));

carpark.get("/carpark", (c) => {
  customLogger("Headers", c.req.header());
  return c.html(
    <html>
      <head>
        <title>Carpark</title>
      </head>
      <body>
        Car Park!
        <br />
        {" "}
        <br />
        <img src="charizard.png" alt="Pokemon's Charizard" width="360" height="230" />
      </body>
    </html>
  );
});

export default carpark;
