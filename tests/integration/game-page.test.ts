import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../../components/Button';
import { GamePage } from '../../components/GamePage';
import type { GameAction, GamePhase, GameScreenData, PreviewPiece } from '../../components/GameScreenData';
import { emptyCells, replacementScreen, suppliedScreen } from './game-screen-fixtures';

function nodes(root: HTMLElement) {
  const query = within(root);
  const stats = query.getByRole('region', { name: 'Показатели партии' });
  const preview = query.getByRole('region', { name: 'Следующая фигура' });
  const controls = query.getByRole('region', { name: 'Управление' });
  return {
    board: query.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк' }),
    stats, preview, controls, status: query.getByRole('status'),
    buttons: within(controls).getAllByRole<HTMLButtonElement>('button'),
  };
}

function metrics(panel: HTMLElement) {
  expect(within(panel).getAllByRole('term')).toHaveLength(4);
  expect(within(panel).getAllByRole('definition')).toHaveLength(4);
  return Object.fromEntries(Array.from(panel.querySelectorAll('dl'), item => [
    within(item).getByRole('term').textContent,
    within(item).getByRole('definition').textContent,
  ]));
}

function occupied(board: HTMLElement) {
  const cells = Array.from(board.querySelectorAll<HTMLElement>('[data-x][data-y]'));
  expect(cells).toHaveLength(200);
  expect(new Set(cells.map(cell => `${cell.dataset.x},${cell.dataset.y}`)).size).toBe(200);
  for (const cell of cells) {
    expect(Number(cell.dataset.x)).toBeGreaterThanOrEqual(0);
    expect(Number(cell.dataset.x)).toBeLessThan(10);
    expect(Number(cell.dataset.y)).toBeGreaterThanOrEqual(0);
    expect(Number(cell.dataset.y)).toBeLessThan(20);
    expect(cell).toHaveAttribute('aria-hidden', 'true');
    if (cell.dataset.state === 'empty') expect(cell).not.toHaveAttribute('data-piece');
  }
  return cells.filter(cell => cell.dataset.state !== 'empty')
    .map(cell => [Number(cell.dataset.x), Number(cell.dataset.y), cell.dataset.state, cell.dataset.piece]);
}

function sourcePreviewRows(panel: HTMLElement) {
  const image = within(panel).getByRole('img');
  const cells = Array.from(image.querySelectorAll<HTMLElement>('[data-state]'));
  const positions = Array.from(image.querySelectorAll<HTMLElement>('[data-preview-x][data-preview-y]'));
  expect(cells).toHaveLength(positions.length ? 20 : 16);
  expect(positions.length === 0 || positions.length === 4).toBe(true);
  expect(cells.filter(cell => cell.dataset.state === 'empty')).toHaveLength(16);
  for (const cell of cells) expect(cell).toHaveAttribute('aria-hidden', 'true');
  const rows = Array.from({ length: 4 }, () => Array<string>(4).fill('.'));
  for (const position of positions) {
    const cell = position.querySelector<HTMLElement>('[data-state="locked"]')!;
    rows[Number(position.dataset.previewY)]![Number(position.dataset.previewX)] = cell.dataset.piece!;
  }
  return rows.map(row => row.join(''));
}

const originalCells = [
  [0, 0, 'locked', 'J'], [9, 0, 'locked', 'I'], [4, 5, 'active', 'T'],
  [3, 6, 'active', 'T'], [4, 6, 'active', 'T'], [5, 6, 'active', 'T'],
  [0, 19, 'locked', 'S'], [9, 19, 'locked', 'L'],
];
const changedCells = [[2, 18, 'locked', 'O'], [3, 18, 'locked', 'O'], [2, 19, 'locked', 'O'], [3, 19, 'locked', 'O']];

describe('real static GamePage composition', () => {
  it('renders supplied coordinates, paired metrics and aggregate semantics without mutating inputs', () => {
    const data = suppliedScreen();
    const before = JSON.stringify(data);
    const page = GamePage({ data, onAction: () => {} });
    document.body.append(page);
    const view = nodes(page);
    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Tetris OOP' })).toBeVisible();
    for (const name of ['Показатели партии', 'Следующая фигура', 'Управление', 'Партия идёт']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    expect(occupied(view.board)).toEqual(originalCells);
    expect(metrics(view.stats)).toEqual({ Очки: '1240', Рекорд: '9800', Линии: '0', Уровень: '1' });
    expect(sourcePreviewRows(view.preview)).toEqual(['J...', 'JJJ.', '....', '....']);
    expect(within(view.preview).getByRole('img', { name: 'Следующая фигура: J' })).toBeVisible();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(view.status).toHaveAttribute('aria-live', 'polite');
    expect(view.status).toHaveAttribute('aria-atomic', 'true');
    expect(view.status).toHaveAttribute('data-phase', 'running');
    expect(JSON.stringify(data)).toBe(before);
  });

  it('updates all data, clears stale pieces and preserves live/control nodes and enabled focus', async () => {
    const user = userEvent.setup();
    const first = suppliedScreen();
    const next = replacementScreen();
    const before = [JSON.stringify(first), JSON.stringify(next)];
    const page = GamePage({ data: first, onAction: () => {} });
    document.body.append(page);
    const initial = nodes(page);
    await user.click(initial.buttons[0]!);
    page.update(next);
    const updated = nodes(page);
    expect(updated.controls).toBe(initial.controls);
    expect(updated.status).toBe(initial.status);
    updated.buttons.forEach((button, index) => expect(button).toBe(initial.buttons[index]));
    expect(updated.buttons[0]).toHaveFocus();
    expect(updated.buttons[0]).toHaveAccessibleName('Продолжить игру');
    for (const old of [initial.board, initial.stats, initial.preview]) expect(old).not.toBeInTheDocument();
    expect(occupied(updated.board)).toEqual(changedCells);
    expect(metrics(updated.stats)).toEqual({ Очки: '7700', Рекорд: '11000', Линии: '12', Уровень: '2' });
    expect(sourcePreviewRows(updated.preview)).toEqual(['..L.', 'LLL.', '....', '....']);
    expect(updated.status).toHaveTextContent('Пауза');
    expect(updated.status).toHaveAttribute('data-phase', 'paused');
    expect(within(page).queryByText('Партия идёт', { exact: true })).not.toBeInTheDocument();

    await user.click(updated.buttons[1]!);
    page.update(first);
    expect(nodes(page).buttons[1]).toBe(initial.buttons[1]);
    expect(initial.buttons[1]).toHaveFocus();
    expect(initial.buttons[1]).toHaveAccessibleName('Пауза');
    page.update(next);
    expect(initial.buttons[1]).toHaveFocus();

    page.update(suppliedScreen({ phase: 'ready', cells: emptyCells(), next: null, metrics: { score: 0, highScore: 11000, lines: 0, level: 1 } }));
    const cleared = nodes(page);
    expect(occupied(cleared.board)).toEqual([]);
    expect(sourcePreviewRows(cleared.preview)).toEqual(['....', '....', '....', '....']);
    expect(within(cleared.preview).getByRole('img', { name: 'Следующая фигура ещё не выбрана' })).toBeVisible();
    expect(cleared.preview.querySelectorAll('[data-piece]')).toHaveLength(0);
    expect(metrics(cleared.stats)).toEqual({ Очки: '0', Рекорд: '11000', Линии: '0', Уровень: '1' });
    expect(cleared.buttons[1]).toBe(initial.buttons[1]);
    expect(cleared.buttons[1]).toBeDisabled();
    // A disabled focused control has no specified focus fallback; enabled transitions above do.
    expect([JSON.stringify(first), JSON.stringify(next)]).toEqual(before);
  });

  it('keeps simultaneously mounted pages and their action histories independent', async () => {
    const user = userEvent.setup();
    const a: GameAction[] = [];
    const b: GameAction[] = [];
    const first = GamePage({ data: suppliedScreen(), onAction: action => a.push(action) });
    const second = GamePage({ data: replacementScreen(), onAction: action => b.push(action) });
    document.body.append(first, second);
    const secondBefore = nodes(second);
    first.update(suppliedScreen({ phase: 'gameOver' }));
    await user.click(within(first).getByRole('button', { name: 'Играть снова' }));
    expect(a).toEqual(['restart']);
    expect(b).toEqual([]);
    expect(nodes(second).board).toBe(secondBefore.board);
    expect(metrics(secondBefore.stats)).toEqual({ Очки: '7700', Рекорд: '11000', Линии: '12', Уровень: '2' });
    expect(secondBefore.status).toHaveAttribute('data-phase', 'paused');
    await user.click(within(second).getByRole('button', { name: 'Продолжить игру' }));
    expect(a).toEqual(['restart']);
    expect(b).toEqual(['resume']);
  });
});

describe('commands from externally controlled phases', () => {
  it('publishes exactly one current command per activation after repeated updates', async () => {
    const user = userEvent.setup();
    const received: GameAction[] = [];
    const expected: GameAction[] = [];
    const page = GamePage({ data: suppliedScreen({ phase: 'ready' }), onAction: action => received.push(action) });
    const after = Button({ label: 'После страницы' });
    document.body.append(page, after);
    const original = nodes(page);
    const cases: { phase: GamePhase; title: string; primary: string; command: GameAction; secondary: string; second: GameAction | null }[] = [
      { phase: 'ready', title: 'Готов к новой партии', primary: 'Начать игру', command: 'start', secondary: 'Пауза', second: null },
      { phase: 'running', title: 'Партия идёт', primary: 'Начать заново', command: 'restart', secondary: 'Пауза', second: 'pause' },
      { phase: 'paused', title: 'Пауза', primary: 'Продолжить игру', command: 'resume', secondary: 'Начать заново', second: 'restart' },
      { phase: 'gameOver', title: 'Партия завершена', primary: 'Играть снова', command: 'restart', secondary: 'Пауза', second: null },
      { phase: 'running', title: 'Партия идёт', primary: 'Начать заново', command: 'restart', secondary: 'Пауза', second: 'pause' },
    ];
    for (const entry of cases) {
      const data = suppliedScreen({ phase: entry.phase });
      page.update(data);
      page.update(data);
      const view = nodes(page);
      expect(view.buttons[0]).toBe(original.buttons[0]);
      expect(view.buttons[1]).toBe(original.buttons[1]);
      expect(view.buttons[0]).toHaveAccessibleName(entry.primary);
      expect(view.buttons[1]).toHaveAccessibleName(entry.secondary);
      await user.click(view.buttons[0]!);
      expected.push(entry.command);
      expect(received).toEqual(expected);
      expect(view.buttons[0]).toHaveFocus();
      await user.keyboard('{Enter}');
      expected.push(entry.command);
      expect(received).toEqual(expected);
      await user.tab();
      if (entry.second) {
        expect(view.buttons[1]).toBeEnabled();
        expect(view.buttons[1]).toHaveFocus();
        await user.keyboard('{Enter}');
        expected.push(entry.second);
      } else {
        expect(view.buttons[1]).toBeDisabled();
        expect(after).toHaveFocus();
        view.buttons[1]!.click();
      }
      expect(received).toEqual(expected);
      expect(view.status).toHaveAttribute('data-phase', entry.phase);
      expect(within(view.status).getByRole('heading', { name: entry.title })).toBeVisible();
      expect(view.buttons[0]).toHaveAccessibleName(entry.primary);
    }
  });

  it('keeps both actions unavailable without a handler in every phase and skips them with Tab', async () => {
    const user = userEvent.setup();
    const before = Button({ label: 'До страницы' });
    const page = GamePage({ data: suppliedScreen() });
    const after = Button({ label: 'После страницы' });
    document.body.append(before, page, after);
    for (const phase of ['ready', 'running', 'paused', 'gameOver'] as const) {
      page.update(suppliedScreen({ phase }));
      const view = nodes(page);
      for (const button of view.buttons) {
        expect(button).toBeDisabled();
        await user.click(button);
        button.click();
      }
      expect(view.status).toHaveAttribute('data-phase', phase);
      expect(view.controls).toHaveTextContent('Демонстрация интерфейса. Управление пока недоступно.');
      before.focus();
      await user.tab();
      expect(after).toHaveFocus();
    }
  });
});

const shortRow = emptyCells();
shortRow[7] = emptyCells(1, 9)[0]!;
const longRow = emptyCells();
longRow[7] = emptyCells(1, 11)[0]!;
const badBoards = [
  { name: '19 rows', patch: { cells: emptyCells(19) } },
  { name: '21 rows', patch: { cells: emptyCells(21) } },
  { name: 'short nonfirst row', patch: { cells: shortRow } },
  { name: 'long nonfirst row', patch: { cells: longRow } },
];
const previewWith = (x: number, y: number): PreviewPiece => ({ kind: 'J', cells: [{ x, y }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] });
const badPreviews = [
  { name: 'duplicate points', patch: { next: previewWith(0, 1) } },
  { name: 'fractional x', patch: { next: previewWith(0.5, 0) } },
  { name: 'fractional y', patch: { next: previewWith(0, 0.5) } },
  { name: 'negative x', patch: { next: previewWith(-1, 0) } },
  { name: 'negative y', patch: { next: previewWith(0, -1) } },
  { name: 'x beyond preview', patch: { next: previewWith(4, 0) } },
  { name: 'y beyond preview', patch: { next: previewWith(0, 4) } },
];

const rejectedUpdates: { group: string; cases: { name: string; patch: Partial<GameScreenData> }[] }[] = [
  { group: 'board dimensions', cases: badBoards },
  { group: 'preview coordinates', cases: badPreviews },
];

describe.each(rejectedUpdates)('atomic rejection of $group', ({ cases }) => {
  it.each(cases)('keeps the visible page coherent after $name and recovers', async ({ patch }) => {
    const user = userEvent.setup();
    const history: GameAction[] = [];
    const page = GamePage({ data: suppliedScreen(), onAction: action => history.push(action) });
    document.body.append(page);
    const before = nodes(page);
    before.buttons[0]!.focus();
    expect(() => page.update(replacementScreen(patch))).toThrow(RangeError);
    const after = nodes(page);
    for (const key of ['board', 'stats', 'preview', 'controls', 'status'] as const) expect(after[key]).toBe(before[key]);
    after.buttons.forEach((button, index) => expect(button).toBe(before.buttons[index]));
    expect(before.buttons[0]).toHaveFocus();
    expect(occupied(after.board)).toEqual(originalCells);
    expect(metrics(after.stats)).toEqual({ Очки: '1240', Рекорд: '9800', Линии: '0', Уровень: '1' });
    expect(sourcePreviewRows(after.preview)).toEqual(['J...', 'JJJ.', '....', '....']);
    expect(after.status).toHaveAttribute('data-phase', 'running');
    await user.click(after.buttons[0]!);
    expect(history).toEqual(['restart']);
    page.update(replacementScreen());
    expect(occupied(nodes(page).board)).toEqual(changedCells);
    expect(metrics(nodes(page).stats)).toEqual({ Очки: '7700', Рекорд: '11000', Линии: '12', Уровень: '2' });
    expect(sourcePreviewRows(nodes(page).preview)).toEqual(['..L.', 'LLL.', '....', '....']);
    expect(nodes(page).buttons[0]).toHaveFocus();
    await user.click(within(page).getByRole('button', { name: 'Продолжить игру' }));
    expect(history).toEqual(['restart', 'resume']);
  });
});
