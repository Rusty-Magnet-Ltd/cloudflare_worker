import { Hono } from "hono";

const carpark = new Hono();

carpark.get("/carpark", (c) => {
  console.log("*** Headers ***");
  for (const key in c.req.header()) {
    const val = c.req.header(key);
    console.log(`${key}: ${val}`);
  }
  return c.html(
    <html>
      <head>
        <title>Carpark</title>
      </head>
      <body>
        Car Park!
        <br />
        <br />
        <img
          src="charizard.png"
          alt="Pokemon's Charizard"
          width="360"
          height="230"
        />
      </body>
    </html>
  );
});

export default carpark;
