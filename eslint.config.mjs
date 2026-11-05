// @ts-check
import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    // `wrangler dev` writes bundled JS to .wrangler/ next to each wrangler.toml (the root and origin/);
    // flat config only skips node_modules/ and .git/ by default
    globalIgnores(["**/.wrangler/"]),
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
);