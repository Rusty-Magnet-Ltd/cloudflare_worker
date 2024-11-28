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
    title: "/dosbody",
    description: "POST request that trips if you send 5> bytes"
  },
  {
    title: "/content",
    description: "POST request that checks the content-length VS whatever the client sent"
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
