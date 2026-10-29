import type { Locator, Page } from '@playwright/test';
import { test, expect, openStory } from './fixtures';
import { expectGameLayout } from './game-shell-layout';
import { expectReadable } from './text-layout';

async function expectMetrics(page: Page, values: Record<string, string>) {
  const actual = await page.getByRole('region', { name: 'Показатели партии' }).locator('dl').evaluateAll(items =>
    Object.fromEntries(items.map(item => [item.querySelector('dt')?.textContent, item.querySelector('dd')?.textContent])));
  expect(actual).toEqual(values);
}

async function cells(board: Locator) {
  return board.locator('[data-x][data-y]').evaluateAll(elements => elements
    .filter(element => element.getAttribute('data-state') !== 'empty')
    .map(element => [Number(element.getAttribute('data-x')), Number(element.getAttribute('data-y')), element.getAttribute('data-state'), element.getAttribute('data-piece')]));
}

const demoOccupied = [
  [4, 3, 'active', 'T'], [3, 4, 'active', 'T'], [4, 4, 'active', 'T'], [5, 4, 'active', 'T'],
  [8, 17, 'locked', 'L'],
  [0, 18, 'locked', 'J'], [1, 18, 'locked', 'J'], [2, 18, 'locked', 'J'], [3, 18, 'locked', 'J'],
  [6, 18, 'locked', 'L'], [7, 18, 'locked', 'L'], [8, 18, 'locked', 'L'], [9, 18, 'locked', 'L'],
  [0, 19, 'locked', 'J'], [1, 19, 'locked', 'J'], [2, 19, 'locked', 'J'], [3, 19, 'locked', 'J'],
  [6, 19, 'locked', 'L'], [7, 19, 'locked', 'L'], [8, 19, 'locked', 'L'], [9, 19, 'locked', 'L'],
];

async function expectDemoSnapshot(page: Page, phase: 'running' | 'paused') {
  const status = page.getByRole('status');
  await expect(status).toHaveAttribute('data-phase', phase);
  await expect(status.getByRole('heading', { name: phase === 'running' ? 'Партия идёт' : 'Пауза', exact: true })).toBeVisible();
  await expectMetrics(page, { Очки: '1240', Рекорд: '6800', Линии: '8', Уровень: '1' });
  const board = page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true });
  await expect(board.locator('[data-x][data-y]')).toHaveCount(200);
  expect(await cells(board)).toEqual(demoOccupied);
  const preview = page.getByRole('img', { name: 'Следующая фигура: T', exact: true });
  const occupancy = await preview.locator('[data-state]').evaluateAll(elements => elements.map(element =>
    element.getAttribute('data-state') === 'empty' ? '.' : element.getAttribute('data-piece')).join(''));
  expect(occupancy).toBe('.T..TTT.........');
}

async function expectAllTextReadable(container: Locator) {
  const targets = await container.locator('h1,h2,h3,p,span').all();
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    const text = await target.textContent();
    if (text?.trim()) await expectReadable(target, text, false);
  }
}

for (const width of [320, 768, 1280]) {
  test(`production ready screen exposes only available controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    expect((await page.goto('http://127.0.0.1:4180/'))?.ok()).toBe(true);
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1, name: 'Tetris OOP', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    for (const name of ['Показатели партии', 'Следующая фигура', 'Управление']) {
      await expect(main.getByRole('region', { name, exact: true })).toBeVisible();
    }
    const board = page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true });
    const preview = page.getByRole('img', { name: 'Следующая фигура ещё не выбрана', exact: true });
    const status = page.getByRole('status');
    const controls = page.getByRole('region', { name: 'Управление', exact: true });
    const actions = controls.getByRole('button');
    const expectReady = async () => {
      await expectMetrics(page, { Очки: '0', Рекорд: '0', Линии: '0', Уровень: '1' });
      await expect(board.locator('[data-x][data-y]')).toHaveCount(200);
      await expect(board.locator('[data-state="empty"]')).toHaveCount(200);
      expect(await cells(board)).toEqual([]);
      await expect(preview.locator('[data-state="empty"]')).toHaveCount(16);
      await expect(preview.locator('[data-piece]')).toHaveCount(0);
      await expect(main.getByRole('img')).toHaveCount(2);
      await expect(status).toHaveAttribute('data-phase', 'ready');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      await expect(status).toHaveAttribute('aria-atomic', 'true');
      await expect(status.getByRole('heading', { name: 'Готов к новой партии' })).toBeVisible();
      await expect(status).toContainText('Пока доступны начало и перезапуск партии. Движение, падение и пауза появятся позже.');
      await expect(controls.locator('kbd')).toHaveCount(0);
      await expect(actions).toHaveCount(2);
      await expect(actions.nth(0)).toHaveAccessibleName('Начать игру');
      await expect(actions.nth(0)).toBeEnabled();
      await expect(actions.nth(1)).toHaveAccessibleName('Пауза');
      await expect(actions.nth(1)).toBeDisabled();
    };
    await expectReady();
    // Reach the enabled Start from a fresh page before a disabled pointer click can affect tab order.
    await page.keyboard.press('Tab');
    await expect(actions.nth(0)).toBeFocused();
    await actions.nth(1).scrollIntoViewIfNeeded();
    const box = (await actions.nth(1).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expectReady();
    await expectGameLayout(page, width);
    await page.reload();
    await expectReady();
    await expectGameLayout(page, width);
  });

  test(`running page respects grid, frame and panel geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openStory(page, 'pages-gamepage--running');
    await expectDemoSnapshot(page, 'running');
    await expectGameLayout(page, width);
  });
}

test('snapshot demo preserves actual controls and focus through pointer and keyboard updates', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openStory(page, 'examples-gamepageinteractiondemo--snapshot-updates');
  const buttons = page.getByRole('region', { name: 'Управление', exact: true }).getByRole('button');
  const original = [(await buttons.nth(0).elementHandle())!, (await buttons.nth(1).elementHandle())!];
  const retained = async (focused: number) => {
    for (const [index, handle] of original.entries()) {
      expect(await buttons.nth(index).evaluate((element, old) => element === old, handle)).toBe(true);
    }
    expect(await original[focused]!.evaluate(element => element === document.activeElement)).toBe(true);
  };
  await page.getByRole('button', { name: 'Начать игру', exact: true }).click();
  await expectDemoSnapshot(page, 'running');
  await retained(0);
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.keyboard.press('Tab');
    await expect(buttons.nth(1)).toHaveAccessibleName('Пауза');
    await page.keyboard.press('Enter');
    await expectDemoSnapshot(page, 'paused');
    await retained(1);
    await page.keyboard.press('Shift+Tab');
    await expect(buttons.nth(0)).toHaveAccessibleName('Продолжить игру');
    await page.keyboard.down('Space');
    await expect(page.getByRole('status')).toHaveAttribute('data-phase', 'paused');
    await page.keyboard.up('Space');
    await expectDemoSnapshot(page, 'running');
    await retained(0);
  }
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expectDemoSnapshot(page, 'paused');
  await expect(buttons.nth(1)).toHaveAccessibleName('Начать заново');
  await page.keyboard.press('Enter');
  await expectDemoSnapshot(page, 'running');
  await retained(1);
  await Promise.all(original.map(handle => handle.dispose()));
  // These are fixture transitions. Literal integration action histories prove general exactly-once dispatch.
});

test('large page values and default text stay readable at 320px and verified 200% root font', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openStory(page, 'pages-gamepage--large-values');
  await expectMetrics(page, { Очки: '123456789012345', Рекорд: '999999999999999', Линии: '123456', Уровень: '12345' });
  const metric = page.getByText('123456789012345', { exact: true });
  const baseline = await expectReadable(metric, '123456789012345', true);
  await expectAllTextReadable(page.getByRole('main'));
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const enlarged = await expectReadable(metric, '123456789012345', true);
  expect(enlarged.fontSize).toBeGreaterThanOrEqual(baseline.fontSize * 1.99);
  await expectAllTextReadable(page.getByRole('main'));
  await expectGameLayout(page, 320);
  await expect(page.getByRole('button', { name: 'Начать заново', exact: true })).toBeDisabled();
});

test('long custom status stays readable at 320px and verified 200% root font', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openStory(page, 'blocks-gamestatus--long-message');
  const text = 'Вы можете продолжить партию после возвращения к активной вкладке. Поле и показатели останутся на своих местах.';
  const message = page.getByText(text, { exact: true });
  const baseline = await expectReadable(message, text, true);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const enlarged = await expectReadable(message, text, true);
  expect(enlarged.fontSize).toBeGreaterThanOrEqual(baseline.fontSize * 1.99);
  await expectAllTextReadable(page.getByRole('status'));
});

test('snapshot controls remain usable without losing focus at 320px and 200% root font', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openStory(page, 'examples-gamepageinteractiondemo--snapshot-updates');
  const start = page.getByRole('button', { name: 'Начать игру', exact: true });
  const original = (await start.elementHandle())!;
  const caption = start.locator('span');
  const baseline = await expectReadable(caption, 'Начать игру', false);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const enlarged = await expectReadable(caption, 'Начать игру', true);
  expect(enlarged.fontSize).toBeGreaterThanOrEqual(baseline.fontSize * 1.99);
  await start.click();
  await expectDemoSnapshot(page, 'running');
  expect(await original.evaluate(element => element === document.activeElement)).toBe(true);
  await expectReadable(page.getByRole('button', { name: 'Начать заново', exact: true }).locator('span'), 'Начать заново', true);
  await expectAllTextReadable(page.getByRole('main'));
  await expectGameLayout(page, 320);
  await original.dispose();
});
