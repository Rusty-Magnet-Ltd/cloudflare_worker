export const features = [
  {
    title: "/",
    description: "A Cloudflare Worker with Hono"
  },
  {
    title: "/generate",
    description: "GET a signed Json Web Token ( JWT )"
  },
  {
    title: "/verify",
    description: "GET check JWT in good standing"
  },
  {
    title: "/stopdos",
    description: "GET a form whose POST goes through a shield: bodies over 1 MiB, or with a missing or wrong Content-Length, never reach the fragile origin behind it"
  },
  {
    title: "/content",
    description: "POST request that counts the body and compares it to the content-length the client declared"
  },
  {
    title: "/expensive",
    description: "GET that triggers a Redis based Rate Limit alternative to traditional Cloudflare Rate Limits"
  },
  {
    title: "/workflow",
    description: "GET start a server side task"
  },
  {
    title: "/carpark",
    description: "GET a Waiting Room"
  }
];
