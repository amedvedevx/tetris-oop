import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { expectGameLayout } from './game-shell-layout';
import { expectReadoutsSeparated } from './readout-layout';
import { expectReadable } from './text-layout';

async function openGame(page: Page, width: number) {
  // Install before the app can create any timers. Only the time boundary is controlled.
  await page.clock.install({ time: new Date('2026-11-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-01T01:00:00Z'));
  await page.setViewportSize({ width, height: 1000 });
  expect((await page.goto('http://127.0.0.1:4180/'))?.ok()).toBe(true);
  await expect(page).toHaveTitle('Tetris OOP');
  const panel = page.getByRole('region', { name: 'Показатели партии', exact: true });
  const primary = page.getByRole('region', { name: 'Управление', exact: true }).getByRole('button', {
    name: /^(Начать игру|Начать заново)$/,
  });
  const status = page.getByRole('status');
  const expectTime = async (time: string) => {
    await expect(panel.locator('dl')).toHaveCount(2);
    await expect(panel.locator('dt')).toHaveText(['score', 'time']);
    await expect(panel.locator('dd')).toHaveText(['0000', time]);
  };
  return { panel, primary, status, expectTime };
}

async function expectReadableFooter(panel: Locator, time: string) {
  await expectReadable(panel.locator('dd').first(), '0000', false);
  await expectReadable(panel.locator('dd').last(), time, false);
  await expectReadoutsSeparated(panel);
}

for (const width of [320, 768]) {
  test(`the running timer remains readable below the board at ${width}px`, async ({ page }) => {
    const game = await openGame(page, width);
    await game.expectTime('00:00');
    await game.primary.click();
    await expect(game.status).toHaveAttribute('data-phase', 'running');
    await page.clock.runFor(1250);
    await game.expectTime('00:01');
    await expect(game.primary).toBeFocused();
    await expectGameLayout(page, width);
    await expectReadableFooter(game.panel, '00:01');
  });
}

test('production time catches up after a late refresh, ignores wall time, and resets on restart and reload', async ({ page }) => {
  const width = 1280;
  const game = await openGame(page, width);
  await page.clock.runFor(5000);
  await expect(game.status).toHaveAttribute('data-phase', 'ready');
  await game.expectTime('00:00');
  await game.primary.click();
  await expect(game.status).toHaveAttribute('data-phase', 'running');
  await game.expectTime('00:00');

  const stable = [
    page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true }),
    page.getByRole('region', { name: 'Следующая фигура', exact: true }),
    game.status,
    game.primary,
  ];
  const originals = await Promise.all(stable.map(async locator => ({
    locator, node: (await locator.elementHandle())!, content: await locator.innerHTML(),
  })));
  const primary = originals.at(-1)!.node;

  await page.clock.runFor(750);
  await game.expectTime('00:00');
  await page.clock.runFor(500);
  await game.expectTime('00:01');
  const beforeDelay = await page.evaluate(() => performance.now());
  // fastForward skips intervening interval deliveries, unlike runFor.
  await page.clock.fastForward(58_750);
  expect(await page.evaluate(() => performance.now())).toBe(beforeDelay + 58_750);
  await game.expectTime('01:00');

  const beforeJump = await page.evaluate(() => ({ wall: Date.now(), monotonic: performance.now() }));
  const newWallTime = beforeJump.wall + 7_200_000;
  await page.clock.setSystemTime(newWallTime);
  expect(await page.evaluate(() => ({ wall: Date.now(), monotonic: performance.now() }))).toEqual({
    wall: newWallTime, monotonic: beforeJump.monotonic,
  });
  // A wall time change alone does not fire callbacks; drive another real refresh.
  await page.clock.runFor(1250);
  await game.expectTime('01:01');
  for (const { locator, node, content } of originals) {
    expect(await locator.evaluate((current, saved) => current === saved, node)).toBe(true);
    expect(await locator.innerHTML()).toBe(content);
  }
  await expect(game.primary).toBeFocused();
  await expectGameLayout(page, width);
  await expectReadableFooter(game.panel, '01:01');

  await page.keyboard.press('Enter');
  expect(await game.primary.evaluate((current, saved) => current === saved, primary)).toBe(true);
  await expect(game.primary).toBeFocused();
  await game.expectTime('00:00');
  await page.clock.runFor(1250);
  await game.expectTime('00:01');
  await Promise.all(originals.map(({ node }) => node.dispose()));

  await page.reload();
  await expect(game.status).toHaveAttribute('data-phase', 'ready');
  await expect(game.primary).toHaveAccessibleName('Начать игру');
  await page.clock.runFor(5000);
  await game.expectTime('00:00');
});
