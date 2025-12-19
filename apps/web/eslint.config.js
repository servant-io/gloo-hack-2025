import { nextJsConfig } from '@repo/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts'],
  },
  ...nextJsConfig,
  {
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
];
