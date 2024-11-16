export type Env = {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

export type JwtEnv = {
  SECURITY_HEADER_NAME: string;
  SECRET_KEY: string;
};
