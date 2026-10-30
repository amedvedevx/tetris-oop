import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { Page } from '@playwright/test';
import type { PieceKind } from '../../src/domain/pieces';
import { shapes } from '../fixtures/new-game-data';
import { test, expect } from './fixtures';
import { expectGameLayout } from './game-shell-layout';
import { expectCenteredPreview } from './preview-layout';

const controlledUrl = 'http://127.0.0.1:4181/tests/fixtures/new-game/';

async function expectReady(page: Page) {
  await expect(page.getByRole('status')).toHaveAttribute('data-phase', 'ready');
  const board = page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true });
  await expect(board.locator('[data-x][data-y]')).toHaveCount(200);
  await expect(board.locator('[data-state="empty"]')).toHaveCount(200);
  await expect(board.locator('[data-piece]')).toHaveCount(0);
  const preview = page.getByRole('img', { name: 'Следующая фигура ещё не выбрана', exact: true });
  await expect(preview.locator('[data-state="empty"]')).toHaveCount(16);
  await expect(preview.locator('[data-piece]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Начать игру', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Пауза', exact: true })).toBeDisabled();
  await expectMetrics(page);
}

async function expectMetrics(page: Page) {
  const actual = await page.getByRole('region', { name: 'Показатели партии', exact: true }).locator('dl').evaluateAll(items =>
    items.map(item => [item.querySelector('dt')?.textContent, item.querySelector('dd')?.textContent]));
  expect(actual).toEqual([['Очки', '0'], ['Рекорд', '0'], ['Линии', '0'], ['Уровень', '1']]);
}

async function expectRunning(page: Page, kind: PieceKind, next: PieceKind, width: number) {
  await expect(page.getByRole('status')).toHaveAttribute('data-phase', 'running');
  const board = page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true });
  await expect(board.locator('[data-x][data-y]')).toHaveCount(200);
  await expect(board.locator('[data-state="empty"]')).toHaveCount(196);
  await expect(board.locator('[data-state="locked"]')).toHaveCount(0);
  const occupied = await board.locator('[data-state="active"]').evaluateAll(cells => cells
    .map(cell => [Number(cell.getAttribute('data-x')), Number(cell.getAttribute('data-y')), cell.getAttribute('data-piece')])
    .sort((a, b) => Number(a[1]) - Number(b[1]) || Number(a[0]) - Number(b[0])));
  expect(occupied).toEqual(shapes[kind].spawn.map(([x, y]) => [x, y, kind]));
  const preview = page.getByRole('img', { name: `Следующая фигура: ${next}`, exact: true });
  await expectCenteredPreview(preview, { kind: next, origin: shapes[next].origin, offsets: shapes[next].offsets });
  await expectMetrics(page);
  await expect(page.getByRole('button', { name: 'Начать заново', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Пауза', exact: true })).toBeDisabled();
  await expectGameLayout(page, width);
}

for (const width of [320, 768, 1280]) {
  test(`controlled new-game flow preserves real state, preview and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    expect((await page.goto(controlledUrl))?.ok()).toBe(true);
    await expect(page).toHaveTitle('Tetris OOP — controlled test entry');
    await expectReady(page);
    const primary = page.getByRole('region', { name: 'Управление', exact: true }).getByRole('button').nth(0);
    const original = (await primary.elementHandle())!;
    const retained = async () => {
      expect(await primary.evaluate((element, old) => element === old, original)).toBe(true);
      expect(await original.evaluate(element => element === document.activeElement)).toBe(true);
    };
    await primary.click();
    await expectRunning(page, 'I', 'O', width);
    await retained();
    await page.keyboard.press('Enter');
    await expectRunning(page, 'L', 'O', width);
    await retained();
    await page.keyboard.down('Space');
    await expectRunning(page, 'L', 'O', width);
    await page.keyboard.up('Space');
    await expectRunning(page, 'J', 'O', width);
    await retained();
    await primary.click();
    await expectRunning(page, 'Z', 'O', width);
    await retained();
    await original.dispose();
    await page.reload();
    await expectReady(page);
    await page.getByRole('button', { name: 'Начать игру', exact: true }).click();
    await expectRunning(page, 'I', 'O', width);
  });
}

test('ordinary production bootstrap starts, restarts and reloads without a controlled entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  expect((await page.goto('http://127.0.0.1:4180/'))?.ok()).toBe(true);
  await expect(page).toHaveTitle('Tetris OOP');
  await expectReady(page);
  const primary = page.getByRole('region', { name: 'Управление', exact: true }).getByRole('button').nth(0);
  const legalKinds = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const assertActualRandomDraw = async () => {
    // Observed kind selects a complete literal oracle; no application geometry is used as expected data.
    await expect(page.getByRole('status')).toHaveAttribute('data-phase', 'running');
    const kind = await page.locator('[data-x][data-y][data-state="active"]').first().getAttribute('data-piece');
    const label = await page.getByRole('region', { name: 'Следующая фигура', exact: true }).getByRole('img').getAttribute('aria-label');
    const next = label?.replace('Следующая фигура: ', '');
    expect(legalKinds).toContain(kind);
    expect(legalKinds).toContain(next);
    expect(next).not.toBe(kind);
    await expectRunning(page, kind as PieceKind, next as PieceKind, 1280);
  };
  await primary.click();
  await assertActualRandomDraw();
  await page.keyboard.press('Enter');
  await assertActualRandomDraw();
  await page.reload();
  await expectReady(page);
});

test('controlled entry and finite random source are absent from the production build', async () => {
  const root = join(process.cwd(), 'dist');
  const files: string[] = [];
  const collect = async (folder: string): Promise<void> => {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await collect(path);
      else files.push(path);
    }
  };
  await collect(root);
  expect(files.filter(path => path.endsWith('.html')).map(path => relative(root, path))).toEqual(['index.html']);
  expect(files.some(path => path.endsWith('.js'))).toBe(true);
  for (const path of files.filter(path => /\.(html|js)$/.test(path))) {
    const content = await readFile(path, 'utf8');
    expect(content).not.toContain('controlled test entry');
    expect(content).not.toContain('Controlled random sequence exhausted');
  }
  const controlled = await readFile('.cache/e2e-app/tests/fixtures/new-game/index.html', 'utf8');
  expect(controlled).toContain('controlled test entry');
});
