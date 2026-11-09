import type { Page } from '@playwright/test';
import { expect } from './fixtures';

/** Relational geometry, not screenshots, utility names or fixed theme dimensions. */
export async function expectGameLayout(page: Page, width: number) {
  const layout = await page.getByRole('main').evaluate(main => {
    const box = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const board = main.querySelector('[aria-label="Игровое поле: 10 столбцов, 20 строк"]')!;
    const preview = main.querySelector('[aria-label="Следующая фигура"]')!;
    const stencil = preview.querySelector('[role="img"]')!;
    const boardCells = Array.from(board.querySelectorAll<HTMLElement>('[data-x][data-y]'), cell => ({
      ...box(cell), column: Number(cell.dataset.x), row: Number(cell.dataset.y),
    }));
    const previewCells = Array.from(stencil.querySelectorAll('[data-state="empty"]'), (cell, index) => ({
      ...box(cell), column: index % 4, row: Math.floor(index / 4),
    }));
    return {
      headerBottom: box(main.querySelector('header')!).bottom,
      board: box(board), status: box(main.querySelector('[role="status"]')!),
      stats: box(main.querySelector('[aria-label="Показатели партии"]')!), preview: box(preview),
      controls: box(main.querySelector('[aria-label="Управление"]')!), stencil: box(stencil),
      previewHeading: box(preview.querySelector('h2')!), previewDetail: box(preview.querySelector('p')!),
      boardCells, previewCells, overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  expect(layout.overflow).toBe(false);
  for (const box of [layout.board, layout.status, layout.stats, layout.preview, layout.controls, layout.stencil]) {
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.right).toBeLessThanOrEqual(width + 1);
  }
  expect(Math.abs(layout.board.x - layout.status.x)).toBeLessThan(1);
  expect(Math.abs(layout.board.right - layout.status.right)).toBeLessThan(1);
  expect(Math.abs(layout.stats.x - layout.board.x)).toBeLessThan(1);
  expect(Math.abs(layout.stats.right - layout.board.right)).toBeLessThan(1);
  expect(Math.abs(layout.stats.y - layout.board.bottom)).toBeLessThan(1);
  expect(layout.status.y).toBeGreaterThanOrEqual(layout.stats.bottom);
  expect(Math.abs(layout.stencil.x + layout.stencil.width / 2 - layout.preview.x - layout.preview.width / 2)).toBeLessThan(1);
  expect(Math.abs(layout.previewHeading.x - layout.previewDetail.x)).toBeLessThan(1);
  expect(layout.previewHeading.x).toBeLessThanOrEqual(layout.stencil.x + 1);
  if (width === 320) {
    expect(layout.preview.y).toBeGreaterThanOrEqual(layout.status.bottom);
  } else {
    expect(layout.preview.x).toBeGreaterThanOrEqual(layout.board.right);
    expect(layout.controls.x).toBeGreaterThanOrEqual(layout.board.right);
    expect(Math.abs(layout.preview.y - layout.board.y)).toBeLessThan(1);
  }
  expect(Math.abs(layout.controls.x - layout.preview.x)).toBeLessThan(1);
  expect(Math.abs(layout.controls.right - layout.preview.right)).toBeLessThan(1);
  const controlsGap = layout.controls.y - layout.preview.bottom;
  const pageGap = layout.board.y - layout.headerBottom;
  expect(controlsGap).toBeGreaterThan(0);
  expect(Math.abs(controlsGap - pageGap), `controls gap ${controlsGap}px should match page gap ${pageGap}px`).toBeLessThan(1);

  for (const [cells, columns, rows] of [[layout.boardCells, 10, 20], [layout.previewCells, 4, 4]] as const) {
    expect(cells).toHaveLength(columns * rows);
    const first = cells.find(cell => cell.column === 0 && cell.row === 0)!;
    expect(first).toBeDefined();
    expect(new Set(cells.map(cell => `${cell.column},${cell.row}`)).size).toBe(columns * rows);
    for (const cell of cells) {
      expect(cell.column).toBeGreaterThanOrEqual(0);
      expect(cell.column).toBeLessThan(columns);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(rows);
      expect(cell.width).toBeGreaterThan(0);
      expect(Math.abs(cell.width - cell.height)).toBeLessThan(1);
      expect(Math.abs(cell.x - first.x - cell.column * first.width)).toBeLessThan(1);
      expect(Math.abs(cell.y - first.y - cell.row * first.height)).toBeLessThan(1);
    }
  }
  const left = Math.min(...layout.boardCells.map(cell => cell.x));
  const right = Math.max(...layout.boardCells.map(cell => cell.right));
  const top = Math.min(...layout.boardCells.map(cell => cell.y));
  const bottom = Math.max(...layout.boardCells.map(cell => cell.bottom));
  expect(Math.abs((bottom - top) - 2 * (right - left))).toBeLessThan(1);
  // Protects the accepted padding→outset-ring regression, not arbitrary extra outside paint.
  const insets = [left - layout.board.x, layout.board.right - right, top - layout.board.y, layout.board.bottom - bottom];
  insets.forEach(inset => expect(inset).toBeGreaterThan(0));
  expect(Math.max(...insets) - Math.min(...insets)).toBeLessThan(1);
  return layout;
}
