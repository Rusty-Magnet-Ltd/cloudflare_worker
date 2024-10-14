import { Hono } from "hono";

const carpark = new Hono();

carpark.get("/carpark", (c) => {
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
