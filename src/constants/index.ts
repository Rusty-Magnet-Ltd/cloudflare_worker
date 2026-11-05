// The routes listed on the home page. In an example, {origin} becomes the
// site's own origin, so it works locally and on foobar.rustymagnet.xyz.
export interface RouteInfo {
  path: string;
  methods: ("GET" | "POST")[];
  summary: string;
  open?: string; // link text, for routes worth opening in a browser
  example?: string; // a curl command, for routes a browser can't show well
}

export const routes: RouteInfo[] = [
  {
    path: "/generate",
    methods: ["GET"],
    summary: "Returns a signed JSON Web Token in the X-Header response header.",
    example: "curl -i {origin}/generate"
  },
  {
    path: "/verify",
    methods: ["GET"],
    summary: "Checks the JWT sent in the X-Header request header: 200 if it's valid, 400 if it's missing and 401 if it isn't.",
    example: "curl -H 'X-Header: <token>' {origin}/verify"
  },
  {
    path: "/stopdos",
    methods: ["GET", "POST"],
    summary: "A form whose POST passes through a shield. Bodies over 100 bytes, malformed or mismatched Content-Length headers and slow bodies are refused before they reach the fragile origin.",
    open: "Open the form"
  },
  {
    path: "/content",
    methods: ["POST"],
    summary: "Counts the request body and compares it with the Content-Length the client declared.",
    example: "curl --data 'hello' {origin}/content"
  },
  {
    path: "/expensive",
    methods: ["GET"],
    summary: "A Redis-based rate limit: three requests every 10 seconds per IP, then 429.",
    open: "Open it, then reload"
  },
  {
    path: "/workflow",
    methods: ["POST"],
    summary: "Starts a two-step Upstash Workflow on the server."
  },
  {
    path: "/carpark",
    methods: ["GET"],
    summary: "A placeholder page for waiting-room experiments.",
    open: "Open the carpark"
  }
];
