import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    passWithNoTests: false,
    allowOnly: !process.env.CI,
    retry: 0,
  },
});
