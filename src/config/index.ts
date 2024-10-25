import { createLocalConfig } from "./envs/local";
import { createProdConfig } from "./envs/prod";

export const appConfig = getConfig();

function getConfig() {
  switch (process.env.ENVIRONMENT) {
    case "PRODUCTION":
      return createProdConfig();
    case "DEVELOPMENT":
      return createLocalConfig();
    default:
      throw new Error(`ENVIRONMENT variable not defined or invalid: "${process.env.ENVIRONMENT}"`);
  }
}
