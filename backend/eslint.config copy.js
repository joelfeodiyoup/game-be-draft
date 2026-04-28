/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    }
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      "@typescript-eslint": require('@typescript-eslint/eslint-plugin'),
      boundaries: require('eslint-plugin-boundaries'),
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        }
      },
      'boundaries/elements': [
        { type: 'worker', pattern: 'src/**/*.workers.ts'},
        { type: 'orchestrator', pattern: 'src/**/*.orchestrators.ts'},
        { type: 'repository', pattern: 'src/**/*.repository.ts'},
        { type: 'service', pattern: 'src/**/*.service.ts'},
      ],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts']
    },
    rules: {
      'boundaries/element-types': [2, {
        default: 'disallow',
        rules: [
          // orchestrators can import workers
          {
            from: { type: 'orchestrator'},
            allow: { to: {type: ['worker']}}
          },
          // workers cannot import repositories (for now)
          {
            from: { type: 'worker'},
            allow: { to: {type: []}}
          }
        ]
      }]
    }
  },
  {
    files: ['**/*.repository.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/databases/postgres/db'],
          message: 'Import prisma client through factory parameters in repositories',
        }]
      }]
    }
  }
];
