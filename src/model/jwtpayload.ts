import { JWTPayload } from "hono/utils/jwt/types";

export function NewJwtPayload(name: string): JWTPayload {
  return {
    sub: name,
    role: "admin",
    iat: Math.floor(Date.now() / 1000), // Token issued now
    exp: Math.floor(Date.now() / 1000) + (60 * 5), // Token expires in 5 minutes
    nbf: Math.floor(Date.now() / 1000)
  };
}
