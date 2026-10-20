import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: [".next/**", ".vercel/**", ".npm-cache/**", ".vercel-cache/**", ".vercel-config/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // JSX component references are not counted by the core unused-vars rule.
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z]", argsIgnorePattern: "^_" }]
    }
  }
];
