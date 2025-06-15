// eslint.config.cjs - CommonJS format for pre-commit.ci compatibility
// This file uses 'require' instead of 'import' statements to ensure
// proper module resolution within the pre-commit.ci isolated environment.

const js = require("@eslint/js/src/index.js"); // Use CommonJS require
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const tseslint = require("typescript-eslint"); // Using 'typescript-eslint' package

// Export the configuration using module.exports
module.exports = tseslint.config(
  { ignores: ["dist"] }, // Ignore build output directory
  {
    // Extend recommended rules from ESLint core and TypeScript ESLint
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // Apply this configuration to TypeScript and TSX files
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020, // Specify ECMAScript version
      globals: globals.browser, // Define browser global variables
    },
    // Define and load ESLint plugins
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    // Define and override specific ESLint rules
    rules: {
      // Apply recommended rules from react-hooks plugin
      ...reactHooks.configs.recommended.rules,
      // Warn if components are not exported as constants, allowing functional components
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Add any other specific rules here if needed
      // For example, to handle React 17/18 JSX transform if not automatically configured:
      // 'react/jsx-uses-react': 'off',
      // 'react/react-in-jsx-scope': 'off',
    },
  }
);
