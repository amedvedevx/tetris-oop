import type { Locator, Page } from '@playwright/test';
import type { PieceKind } from '../../src/domain/pieces';
import { shifted } from '../fixtures/movement-data';
import { shapes, type Coordinates } from '../fixtures/new-game-data';
import { expect, test } from './fixtures';
import { expectGameLayout } from './game-shell-layout';

async function openGame(page: Page, width: number, controlled: boolean) {
  await page.clock.install({ time: new Date('2026-11-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-01T01:00:00Z'));
  await page.setViewportSize({ width, height: 1000 });
  const url = controlled ? 'http://127.0.0.1:4181/tests/fixtures/new-game/' : 'http://127.0.0.1:4180/';
  expect((await page.goto(url))?.ok()).toBe(true);
  await expect(page).toHaveTitle(controlled ? 'Tetris OOP — controlled test entry' : 'Tetris OOP');
  const controls = page.getByRole('region', { name: 'Управление', exact: true });
  return {
    root: page.locator('#app > div'),
    board: page.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк', exact: true }),
    primary: controls.getByRole('button', { name: /^(Начать игру|Начать заново)$/ }),
    left: controls.getByRole('button', { name: 'Сдвинуть фигуру влево', exact: true }),
    right: controls.getByRole('button', { name: 'Сдвинуть фигуру вправо', exact: true }),
  };
}

async function expectFigure(board: Locator, kind: PieceKind, positions: Coordinates) {
  const cells = board.locator('[data-x][data-y][data-state="active"]');
  await expect(cells).toHaveCount(4);
  const actual = await cells.evaluateAll(nodes => nodes
    .map(node => ({ x: Number(node.getAttribute('data-x')), y: Number(node.getAttribute('data-y')), kind: node.getAttribute('data-piece') }))
    .sort((a, b) => a.y - b.y || a.x - b.x));
  expect(actual).toEqual(positions.map(([x, y]) => ({ x, y, kind })));
}

async function observeRightArrows(page: Page) {
  return page.evaluateHandle(() => {
    const events: { repeat: boolean; prevented: boolean; trusted: boolean }[] = [];
    const record = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') events.push({
        repeat: event.repeat, prevented: event.defaultPrevented, trusted: event.isTrusted,
      });
    };
    // Observe after the game root has handled the actual browser event.
    document.addEventListener('keydown', record);
    return { events, stop: () => document.removeEventListener('keydown', record) };
  });
}

for (const width of [320, 1280]) {
  test(`controlled movement respects both walls, native controls and repeated arrows at ${width}px`, async ({ page }) => {
    const game = await openGame(page, width, true);
    await game.primary.click();
    const left = (await game.left.elementHandle())!;
    const right = (await game.right.elementHandle())!;
    const at = (dx: number) => expectFigure(game.board, 'I', shifted(shapes.I.spawn, dx));
    await at(0);

    await game.left.click();
    await at(-1);
    await expect(game.left).toBeFocused();
    await game.right.click();
    await at(0);
    await expect(game.right).toBeFocused();
    await game.left.focus();
    await page.keyboard.press('Enter');
    await at(-1);
    await page.keyboard.down('Space');
    await at(-1);
    await page.keyboard.up('Space');
    await at(-2);
    await expect(game.left).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await at(-3);
    await page.keyboard.press('ArrowLeft');
    await at(-3);

    await game.board.click();
    await expect(game.root).toBeFocused();
    const observed = await observeRightArrows(page);
    await page.keyboard.down('ArrowRight');
    await at(-2);
    await page.keyboard.down('ArrowRight');
    await at(-1);
    await page.keyboard.up('ArrowRight');
    expect(await observed.evaluate(probe => probe.events)).toEqual([
      { repeat: false, prevented: true, trusted: true },
      { repeat: true, prevented: true, trusted: true },
    ]);
    await observed.evaluate(probe => probe.stop());
    await observed.dispose();

    for (const dx of [0, 1, 2, 3]) {
      await page.keyboard.press('ArrowRight');
      await at(dx);
    }
    await page.keyboard.press('ArrowRight');
    await at(3);
    await page.keyboard.press('ArrowLeft');
    await at(2);
    await expect(game.root).toBeFocused();

    const next = page.getByRole('img', { name: 'Следующая фигура: O', exact: true });
    await expect(next.locator('[data-piece="O"]')).toHaveCount(4);
    await expect(page.getByRole('status')).toHaveAttribute('data-phase', 'running');
    const stats = page.getByRole('region', { name: 'Показатели партии', exact: true });
    await expect(stats.locator('dd')).toHaveText(['0000', '00:00']);
    expect(await game.left.evaluate((node, original) => node === original, left)).toBe(true);
    expect(await game.right.evaluate((node, original) => node === original, right)).toBe(true);
    await expectGameLayout(page, width);

    await game.primary.click();
    await expectFigure(game.board, 'L', shapes.L.spawn);
    await expect(game.primary).toBeFocused();
    await expect(next.locator('[data-piece="O"]')).toHaveCount(4);
    await Promise.all([left.dispose(), right.dispose()]);
  });
}

test('production movement works by pointer and focused arrows, but not from outside the game', async ({ page }) => {
  const game = await openGame(page, 1280, false);
  await game.primary.click();
  const observedKind = await game.board.locator('[data-state="active"]').first().getAttribute('data-piece');
  const kind = (Object.keys(shapes) as PieceKind[]).find(candidate => candidate === observedKind);
  expect(kind).toBeDefined();
  const spawn = shapes[kind!].spawn;
  await expectFigure(game.board, kind!, spawn);

  await game.left.click();
  await expect(game.left).toBeFocused();
  await expectFigure(game.board, kind!, shifted(spawn, -1));
  // Inert outside focus target; no access to the game or its state.
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.textContent = 'Outside game';
    document.body.prepend(button);
  });
  const outside = page.getByRole('button', { name: 'Outside game', exact: true });
  await outside.focus();
  await expect(outside).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expectFigure(game.board, kind!, shifted(spawn, -1));

  await game.board.click();
  await expect(game.root).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expectFigure(game.board, kind!, spawn);
});
