import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:6106',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Dedicated static previews, never an already-running development server.
  webServer: [
    {
      command: 'npm run preview -- --outDir dist --host 127.0.0.1 --port 4180 --strictPort',
      url: 'http://127.0.0.1:4180',
      reuseExistingServer: false,
    },
    {
      command: 'npm run preview -- --outDir storybook-static --host 127.0.0.1 --port 6106 --strictPort',
      url: 'http://127.0.0.1:6106/iframe.html',
      reuseExistingServer: false,
    },
    {
      command: 'npm run preview -- --outDir .cache/e2e-app --host 127.0.0.1 --port 4181 --strictPort',
      url: 'http://127.0.0.1:4181/tests/fixtures/new-game/',
      reuseExistingServer: false,
    },
  ],
});
