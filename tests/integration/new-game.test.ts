import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { GameController, type GameState } from '../../src/application/GameController';
import { GameSession } from '../../src/domain/GameSession';
import type { PieceKind } from '../../src/domain/pieces';
import { GameView } from '../../src/presentation/GameView';
import { gameScreen } from '../../src/presentation/gameScreen';
import { ScriptedRandom } from '../fixtures/ScriptedRandom';
import { ManualClock } from '../fixtures/ManualClock';
import { ManualTicker } from '../fixtures/ManualTicker';
import { identityBag, jBag, lBag, shapes, sortedCoordinates, starts, upper } from '../fixtures/new-game-data';

const emptyBoard = () => Array.from({ length: 20 }, () => Array<null>(10).fill(null));
const views: GameView[] = [];
afterEach(() => { views.forEach(view => view.dispose()); views.length = 0; });

function createView(controller: GameController) {
  const view = new GameView(controller, new ManualTicker());
  views.push(view);
  return view;
}

function expectState(state: GameState, kind: PieceKind, next: PieceKind, highScore = 9800) {
  expect(state.phase).toBe('running');
  expect(state.board).toEqual(emptyBoard());
  expect(state.active?.kind).toBe(kind);
  expect(sortedCoordinates(state.active!.cells.map(point => [point.x, point.y]))).toEqual(shapes[kind].spawn);
  expect(state.next).toBe(next);
  expect([state.score, state.lines, state.level, state.highScore]).toEqual([0, 0, 1, highScore]);
}

function expectVisibleState(element: HTMLElement, kind: PieceKind, next: PieceKind) {
  const query = within(element);
  const board = query.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк' });
  expect(board.querySelectorAll('[data-x][data-y]')).toHaveLength(200);
  expect(board.querySelectorAll('[data-state="empty"]')).toHaveLength(196);
  expect(board.querySelectorAll('[data-state="locked"]')).toHaveLength(0);
  const occupied = Array.from(board.querySelectorAll<HTMLElement>('[data-state="active"]'));
  expect(occupied).toHaveLength(4);
  expect(sortedCoordinates(occupied.map(cell => [Number(cell.dataset.x), Number(cell.dataset.y)]))).toEqual(shapes[kind].spawn);
  for (const cell of occupied) expect(cell).toHaveAttribute('data-piece', kind);
  const preview = query.getByRole('img', { name: `Следующая фигура: ${next}` });
  expect(preview.querySelectorAll('[data-state="empty"]')).toHaveLength(16);
  expect(preview.querySelectorAll('[data-state="locked"]')).toHaveLength(4);
  const source = Array.from(preview.querySelectorAll<HTMLElement>('[data-preview-x][data-preview-y]'));
  expect(source).toHaveLength(4);
  expect(sortedCoordinates(source.map(position => [Number(position.dataset.previewX), Number(position.dataset.previewY)]))).toEqual(shapes[next].local);
  for (const cell of preview.querySelectorAll('[data-state="locked"]')) expect(cell).toHaveAttribute('data-piece', next);
  const values = Array.from(query.getByRole('region', { name: 'Показатели партии' }).querySelectorAll('dl'))
    .map(item => [item.querySelector('dt')?.textContent, item.querySelector('dd')?.textContent]);
  expect(values).toEqual([['score', '0000'], ['time', '00:00']]);
  expect(query.getByRole('status')).toHaveAttribute('data-phase', 'running');
  expect(query.getByRole('button', { name: 'Пауза' })).toBeDisabled();
}

describe('new game through real view, controller and domain objects', () => {
  it.each(starts)('starts $kind with $next next from a clean ready screen', async ({ kind, next, random: values }) => {
    const random = new ScriptedRandom(values);
    const controller = new GameController(new GameSession(random, new ManualClock()), 9800);
    const view = createView(controller);
    document.body.append(view.element);
    const query = within(view.element);
    const start = query.getByRole('button', { name: 'Начать игру' });
    const status = query.getByRole('status');
    expect(controller.snapshot()).toEqual({ phase: 'ready', board: emptyBoard(), active: null, next: null, score: 0, lines: 0, level: 1, highScore: 9800, elapsedMs: 0 });
    expect(query.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк' }).querySelectorAll('[data-state="empty"]')).toHaveLength(200);
    expect(query.getByRole('img', { name: 'Следующая фигура ещё не выбрана' }).querySelectorAll('[data-state="empty"]')).toHaveLength(16);
    expect(start).toBeEnabled();
    expect(random.calls).toBe(0);

    await userEvent.setup().click(start);

    expectState(controller.snapshot(), kind, next);
    expectVisibleState(view.element, kind, next);
    expect(query.getByRole('button', { name: 'Начать заново' })).toBe(start);
    expect(start).toHaveFocus();
    expect(query.getByRole('status')).toBe(status);
    expect(random.calls).toBe(6);
  });

  it('discards the old queue on each restart, preserves high score and makes reads/phase guards non-consuming', async () => {
    const random = new ScriptedRandom([...identityBag, ...lBag, ...jBag]);
    const controller = new GameController(new GameSession(random, new ManualClock()), 9800);
    expect(controller.dispatch('restart').phase).toBe('ready');
    expect(random.calls).toBe(0);
    const view = createView(controller);
    document.body.append(view.element);
    const query = within(view.element);
    const primary = query.getByRole('button', { name: 'Начать игру' });
    const user = userEvent.setup();
    await user.click(primary);
    for (let read = 0; read < 3; read++) {
      expectState(controller.snapshot(), 'I', 'O');
      expectState(controller.dispatch('start'), 'I', 'O');
    }
    expect(random.calls).toBe(6);
    await user.keyboard('{Enter}');
    expectState(controller.snapshot(), 'L', 'O');
    expectVisibleState(view.element, 'L', 'O');
    expect(primary).toHaveFocus();
    expect(random.calls).toBe(12);
    await user.keyboard(' ');
    expectState(controller.snapshot(), 'J', 'O');
    expectVisibleState(view.element, 'J', 'O');
    expect(query.getByRole('button', { name: 'Начать заново' })).toBe(primary);
    expect(primary).toHaveFocus();
    expect(random.calls).toBe(18);
  });

  it('isolates nested snapshots and presentation data before and after restart and between sessions', () => {
    const random = new ScriptedRandom([...identityBag, ...lBag]);
    const controller = new GameController(new GameSession(random, new ManualClock()), 9800);
    const other = new GameController(new GameSession(new ScriptedRandom(identityBag), new ManualClock()), 4200);
    controller.dispatch('start');
    other.dispatch('start');
    const old = controller.snapshot();
    const mutable = old as unknown as { board: (PieceKind | null)[][]; active: { kind: PieceKind; cells: { x: number; y: number }[] }; next: PieceKind; score: number; highScore: number };
    mutable.board[0]![0] = 'Z';
    mutable.board[0]!.push('T');
    mutable.board.push(['J']);
    mutable.active.cells[0]!.x = 99;
    mutable.active.cells.push({ x: -1, y: -1 });
    mutable.active.kind = 'Z';
    mutable.next = 'J';
    mutable.score = 700;
    mutable.highScore = 1;
    expectState(controller.snapshot(), 'I', 'O');
    expectState(other.snapshot(), 'I', 'O', 4200);

    const ui = gameScreen(controller.snapshot());
    const uiBoard = ui.cells as { state: string; piece?: PieceKind }[][];
    uiBoard[1]![3] = { state: 'locked', piece: 'Z' };
    const uiPreview = ui.next!.cells as unknown as { x: number; y: number }[];
    uiPreview[0]!.x = 99;
    expectState(controller.snapshot(), 'I', 'O');
    expect(gameScreen(controller.snapshot()).next!.cells.map(point => [point.x, point.y])).toEqual(shapes.O.local);

    expectState(controller.dispatch('restart'), 'L', 'O');
    mutable.board[1]![0] = 'S';
    mutable.active.cells[1]!.y = 99;
    uiPreview[1]!.y = 99;
    expectState(controller.snapshot(), 'L', 'O');
    expectState(other.snapshot(), 'I', 'O', 4200);
    expect(gameScreen(other.snapshot()).next!.cells.map(point => [point.x, point.y])).toEqual(shapes.O.local);
    expect(random.calls).toBe(12);
  });

  it('preserves ready after a late invalid random value and starts successfully on retry', () => {
    const controller = new GameController(new GameSession(new ScriptedRandom([upper, upper, NaN, ...lBag]), new ManualClock()), 9800);
    expect(() => controller.dispatch('start')).toThrow(RangeError);
    expect(controller.snapshot()).toEqual({ phase: 'ready', board: emptyBoard(), active: null, next: null, score: 0, lines: 0, level: 1, highScore: 9800, elapsedMs: 0 });
    expectState(controller.dispatch('start'), 'L', 'O');
  });

  it('keeps commands and rendered state independent between two live game views', async () => {
    const leftRandom = new ScriptedRandom([...identityBag, ...lBag]);
    const rightRandom = new ScriptedRandom(jBag);
    const leftController = new GameController(new GameSession(leftRandom, new ManualClock()), 9800);
    const rightController = new GameController(new GameSession(rightRandom, new ManualClock()), 4200);
    const left = createView(leftController);
    const right = createView(rightController);
    document.body.append(left.element, right.element);
    const user = userEvent.setup();
    await user.click(within(left.element).getByRole('button', { name: 'Начать игру' }));
    expectVisibleState(left.element, 'I', 'O');
    expect(within(right.element).getByRole('status')).toHaveAttribute('data-phase', 'ready');
    expect(rightRandom.calls).toBe(0);
    await user.click(within(right.element).getByRole('button', { name: 'Начать игру' }));
    expectVisibleState(right.element, 'J', 'O');
    await user.click(within(left.element).getByRole('button', { name: 'Начать заново' }));
    expectVisibleState(left.element, 'L', 'O');
    expectVisibleState(right.element, 'J', 'O');
    expectState(leftController.snapshot(), 'L', 'O', 9800);
    expectState(rightController.snapshot(), 'J', 'O', 4200);
    expect(leftRandom.calls).toBe(12);
    expect(rightRandom.calls).toBe(6);
  });

  it('keeps the complete running game after a late random-source failure and restarts on retry', () => {
    const failure = new Error('Random source unavailable');
    const random = new ScriptedRandom([...identityBag, upper, upper, failure, ...lBag]);
    const controller = new GameController(new GameSession(random, new ManualClock()), 9800);
    expectState(controller.dispatch('start'), 'I', 'O');
    expect(() => controller.dispatch('restart')).toThrow(failure);
    expectState(controller.snapshot(), 'I', 'O');
    expectState(controller.dispatch('restart'), 'L', 'O');
    expect(random.calls).toBe(15);
  });
});
