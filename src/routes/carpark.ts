import { Hono } from "hono";

const parking = new Hono();

parking.get("/parking", (c) => c.text("Car park!"));
export default parking;
