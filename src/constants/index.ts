export const features = [
  {
    title: "/",
    description: "A Cloudflare Worker with the Hono http router"
  },
  {
    title: "/generate",
    description: "create a signed JWT"
  },
  {
    title: "/verify",
    description: "No tampering and non-expired JWT"
  },
  {
    title: "/dosbody",
    description: "A POST request that trips if you send 50kb >"
  },
  {
    title: "/expensive",
    description: "A Redis based Rate Limit alternative to traditional Cloudflare Rate Limits"
  },
  {
    title: "/workflow",
    description: "Start a server side task"
  },
  {
    title: "/carpark",
    description: "Landing area for requests that trip Firewall Rules"
  }
];
