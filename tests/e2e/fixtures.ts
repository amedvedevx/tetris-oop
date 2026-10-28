import { test as base, expect, type Page } from '@playwright/test';

export const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('requestfailed', request => errors.push(`request: ${request.url()} ${request.failure()?.errorText}`));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    await use();
    expect(errors, 'browser errors and failed asset loads').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function openStory(page: Page, id: string): Promise<void> {
  const response = await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  expect(response?.ok()).toBe(true);
  await expect(page.locator('#storybook-root > *')).toBeVisible();
}
