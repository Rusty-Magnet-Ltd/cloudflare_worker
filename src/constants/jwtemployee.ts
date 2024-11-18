import { JWTPayload } from "hono/utils/jwt/types";

export const employeePayload: JWTPayload = {
  sub: "Bob",
  role: "admin",
  department: "hr",
  exp: Math.floor(Date.now() / 1000) + (60 * 5), // Token expires in 5 minutes
  iat: Math.floor(Date.now() / 1000),
  nbf: Math.floor(Date.now() / 1000)
};
