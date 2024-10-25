import { defineConfig } from "../defineConfig";

export function createLocalConfig() {
  return defineConfig({
    env: "DEVELOPMENT",
    apiURL: "http://localhost:8787"
  });
}
