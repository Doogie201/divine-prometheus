/* eslint-env node */
/* eslint-env node */
// eslint.config.cjs
const js = require("@eslint/js/src/index.js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  js.configs.recommended,
  {
    languageOptions:   { globals: { ...globals.browser } },
    plugins:           { "react-hooks": reactHooks },
    rules:             { ...reactHooks.configs.recommended.rules },
  },
];
module.exports.push({
    ignores: ["eslint.config.*", "commitlint.config.*"],
  });
  