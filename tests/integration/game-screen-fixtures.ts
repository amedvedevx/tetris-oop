import type { CellContent } from '../../components/BoardCell';
import type { GameScreenData } from '../../components/GameScreenData';

export function emptyCells(rows = 20, columns = 10): CellContent[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, (): CellContent => ({ state: 'empty' })));
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

// Test-owned inputs; expectations live separately in the tests, never in app fixtures.
export function suppliedScreen(overrides: Partial<GameScreenData> = {}): GameScreenData {
  const cells = emptyCells();
  cells[0]![0] = { state: 'locked', piece: 'J' };
  cells[0]![9] = { state: 'locked', piece: 'I' };
  cells[5]![4] = { state: 'active', piece: 'T' };
  for (const x of [3, 4, 5]) cells[6]![x] = { state: 'active', piece: 'T' };
  cells[19]![0] = { state: 'locked', piece: 'S' };
  cells[19]![9] = { state: 'locked', piece: 'L' };
  return freeze({
    phase: 'running', cells,
    next: { kind: 'J', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
    metrics: { score: 1240, lines: 0, level: 1, highScore: 9800 },
    ...overrides,
  } satisfies GameScreenData);
}

export function replacementScreen(overrides: Partial<GameScreenData> = {}): GameScreenData {
  const cells = emptyCells();
  cells[18]![2] = { state: 'locked', piece: 'O' };
  cells[18]![3] = { state: 'locked', piece: 'O' };
  cells[19]![2] = { state: 'locked', piece: 'O' };
  cells[19]![3] = { state: 'locked', piece: 'O' };
  return suppliedScreen({
    phase: 'paused', cells,
    next: { kind: 'L', cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
    metrics: { score: 7700, lines: 12, level: 2, highScore: 11000 },
    ...overrides,
  });
}
