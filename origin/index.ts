import { Hono } from "hono";

// The real service fell over on bodies past 1 MiB. This one pretends to at a demo-sized
// 100 bytes, the same as the shield's cap, so it's easy to trip by hand.
const CRASH_ABOVE_BYTES = 100;

const origin = new Hono<{ Variables: { received: number } }>();

// Reads every body in full, with no size limit and no deadline, and logs what arrived
origin.use(async (c, next) => {
  const received = c.req.raw.body ? (await c.req.arrayBuffer()).byteLength : 0;
  const contentLength = c.req.header("content-length") ?? "-";
  const transferEncoding = c.req.header("transfer-encoding") ?? "-";
  console.log(`fragile-origin ${c.req.method} ${c.req.path} content-length=${contentLength} transfer-encoding=${transferEncoding} received=${received}`);
  c.set("received", received);
  await next();
});

origin.get("/stopdos", (c) => c.html(formPage));

origin.post("/stopdos", (c) => {
  const received = c.get("received");
  if (received > CRASH_ABOVE_BYTES) {
    return c.text("crashed (simulated)", 500);
  }
  if ((c.req.header("accept") ?? "").includes("text/html")) {
    return c.redirect("/stopdos/thanks", 303); // POST/Redirect/GET to the good page
  }
  const declared = c.req.header("content-length");
  return c.json({ ok: true, received, contentLength: declared === undefined ? null : Number(declared) });
});

origin.get("/stopdos/thanks", (c) => c.html(thanksPage));

const formPage = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Submit a form</title></head>
  <body>
    <h1>Submit a form</h1>
    <p>This service crashes on bodies over 100 bytes. Through the shield they're refused; sent straight here, they crash it.</p>
    <form method="post" action="/stopdos">
      <h2>URL-encoded</h2>
      <textarea name="message" rows="6" cols="60"></textarea>
      <p><button type="submit">Send text</button></p>
    </form>
    <form method="post" action="/stopdos" enctype="multipart/form-data">
      <h2>Multipart</h2>
      <input type="file" name="upload">
      <p><button type="submit">Send file</button></p>
    </form>
  </body>
</html>
`;

const thanksPage = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Thanks</title></head>
  <body><h1>Thanks, your form arrived</h1><p><a href="/stopdos">Send another</a></p></body>
</html>
`;

export default origin;
