import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";

export type JwtEnv = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
  SIGNING_ALGORITHM: SignatureAlgorithm;
};
