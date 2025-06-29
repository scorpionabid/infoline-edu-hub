import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores
  { 
    ignores: [
      "dist/**",
      "node_modules/**",
      "supabase/functions/**",
      "backup/**",
      "docs/**",
      "docker/**",
      "monitoring/**",
      "maintenance/**",
      "scripts/**",
      "**/*.sql",
      "**/*.md",
      "**/*.sh",
      ".env*",
      "*.config.*"
    ] 
  },
  // Frontend kod bazası üçün konfiqurasiya
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // TypeScript xətalarını azalt
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }],
      "@typescript-eslint/no-explicit-any": "off", // Layihə böyük olduğu üçün off
      "@typescript-eslint/no-non-null-assertion": "off", // ! operatoru üçün
      "@typescript-eslint/ban-ts-comment": "off", // @ts-ignore comments üçün
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      
      // JavaScript xətalarını azalt  
      "no-unused-vars": "off", // TypeScript versiyasını istifadə edirik
      "no-undef": "off", // TypeScript yoxlayır
      "no-case-declarations": "off", // Switch case problemləri
      "no-fallthrough": "off",
      "no-empty": "off",
      "no-constant-condition": "off",
      "no-useless-escape": "off",
      
      // React xətalarını azalt
      "react-hooks/exhaustive-deps": "off", // error əvəzinə warning
      
      // General qaydalar
      "prefer-const": "warn",
      "no-var": "warn",
      "no-console": "off", // Development üçün console.log-a icazə ver
      
      // Restricted imports for refactored types
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["**/authTypes", "**/database.d"],
              "message": "Use unified types from @/types instead. authTypes.ts is deprecated, use @/types/auth or @/types."
            }
          ]
        }
      ],
    },
  },
  // Config faylları üçün ayrı konfiqurasiya
  {
    files: ["*.config.{js,ts}", "vite.config.ts", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
