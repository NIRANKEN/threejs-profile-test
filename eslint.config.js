import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactThree from "@react-three/eslint-plugin";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@react-three": reactThree,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactThree.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            // Three.js / React Three Fiber props
            "args",
            "attach",
            "geometry",
            "material",
            "position",
            "rotation",
            "scale",
            "castShadow",
            "receiveShadow",
            "intensity",
            "distance",
            "decay",
            "angle",
            "penumbra",
            "color",
            "emissive",
            "emissiveIntensity",
            "roughness",
            "metalness",
            "map",
            "bumpMap",
            "bumpScale",
            "roughnessMap",
            "metalnessMap",
            "normalMap",
            "displacementMap",
            "transparent",
            "opacity",
            "dispose",
            "shadow-mapSize",
            "shadow-bias",
          ],
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
