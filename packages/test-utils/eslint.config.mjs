import js from "@eslint/js";
import tseslint from "typescript-eslint";
import archetypeRules from "@archetype/eslint-config";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...archetypeRules,
  {
    ignores: ["node_modules/**"],
  },
);
