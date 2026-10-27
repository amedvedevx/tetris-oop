import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'storybook-static/**', '.runtime/**', '.cache/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.ts'], languageOptions: { globals: globals.browser } },
  {
    files: ['*.config.*', '.storybook/*.ts'],
    languageOptions: { globals: globals.node },
  },
];
