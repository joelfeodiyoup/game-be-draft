const boundaries = require("eslint-plugin-boundaries");
const typescriptParser = require("@typescript-eslint/parser");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const rootConfig = require("../eslint.config.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...rootConfig,
  // {
  //   files: ['**/*.ts', '**/*.js'],
  //   languageOptions: {
  //     parser: require('@typescript-eslint/parser'),
  //     parserOptions: {
  //       ecmaVersion: 'latest',
  //       sourceType: 'module',
  //     },
  //   }
  // },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      boundaries,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
      },
      'boundaries/elements': [
        {type: 'controller', pattern: '**/*.controller.ts', mode: 'file'},
        {type: 'middleware', pattern: '**/*.middleware.ts', mode: 'file'},
        {type: 'orchestrator', pattern: '**/*.orchestrator.ts', mode: 'file'},
        {type: 'worker', pattern: '**/*.worker.ts', mode: 'file'},
        {type: 'repository', pattern: '**/*.repository.ts', mode: 'file'},
      ]
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          {
            from: {type: 'controller'},
            allow: { to: {type: ['controller', 'middleware', 'orchestrator']}}
          },
          {
            from: {type: 'middleware'},
            allow: { to: {type: ['orchestrator']}}
          },
          // orchestrators can import workers
          {
            from: { type: 'orchestrator'},
            allow: { to: {type: ['worker']}}
          },
          // workers can import repositories and other workers
          {
            from: { type: 'worker'},
            allow: { to: {type: ['repository', 'worker']}}
          },
        ]
      }]
    }
  }
];
