import eslintConfig from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  eslintConfig.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    name: 'lin/EsLintIgnores',
    ignores: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.next/**',
      '**/.nx/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/.DS_Store/**',
      '**/dist/**',
      'index.html'
    ]
  },
  {
    name: 'lin/EsLint',
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    },
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  }
];
