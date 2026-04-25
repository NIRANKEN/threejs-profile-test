import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import oxlint from 'eslint-plugin-oxlint';

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
    },
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  ...oxlint.configs['flat/recommended'],
];
