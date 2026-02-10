// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  {
    ignores: [".wrangler/*"]
  },
  stylistic.configs.customize({
    braceStyle: "1tbs",
    commaDangle: "never",
    indent: 2, // for tabs, use "tab"
    jsx: true,
    quotes: "double",
    semi: true
  })
);
