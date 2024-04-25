import { Hono } from "hono";

const carpark = new Hono();

carpark.get("/carpark", (c) => c.text("Car park!"));
export default carpark;
