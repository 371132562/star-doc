import { starEslint } from '@linstarzzz/eslint-prettier-config';

export default [
  ...starEslint('eslint', { ts: true }),
  {
    name: 'starDocEsLint',
    ignores: ['**/theme/index.ts']
  }
];
