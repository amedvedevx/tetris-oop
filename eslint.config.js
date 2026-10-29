import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'storybook-static/**', '.runtime/**', '.cache/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.ts'], languageOptions: { globals: globals.browser } },
  {
    files: ['*.config.*', '.storybook/*.ts'],
    languageOptions: { globals: globals.node },
  },
];
