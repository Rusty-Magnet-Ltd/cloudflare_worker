import { defineConfig } from "../defineConfig";

export function createProdConfig() {
  return defineConfig({
    env: "PRODUCTION",
    apiURL: "https://foobar.rustymagnet.xyz"
  });
}
