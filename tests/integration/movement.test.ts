import { within } from '@testing-library/dom';
import { afterEach, expect, it } from 'vitest';
import { GameController, type GameState } from '../../src/application/GameController';
import { GameSession } from '../../src/domain/GameSession';
import type { PieceKind } from '../../src/domain/pieces';
import { GameView } from '../../src/presentation/GameView';
import { ManualClock } from '../fixtures/ManualClock';
import { ManualTicker } from '../fixtures/ManualTicker';
import { shifted } from '../fixtures/movement-data';
import { identityBag, lBag, shapes, starts } from '../fixtures/new-game-data';
import { ScriptedRandom } from '../fixtures/ScriptedRandom';

const views: GameView[] = [];
afterEach(() => { views.splice(0).forEach(view => view.dispose()); });

function newGame(values: readonly number[] = [...identityBag, ...lBag]) {
  const random = new ScriptedRandom(values);
  const controller = new GameController(new GameSession(random, new ManualClock(85_000)), 9800);
  return { controller, random };
}

function mountGame() {
  const game = newGame();
  const view = new GameView(game.controller, new ManualTicker());
  views.push(view);
  const root = view.element;
  document.body.append(root);
  const screen = within(root);
  const board = () => screen.getByRole('img', { name: 'Игровое поле: 10 столбцов, 20 строк' });
  const primary = () => screen.getByRole<HTMLButtonElement>('button', { name: /^(Начать игру|Начать заново)$/ });
  const left = screen.getByRole<HTMLButtonElement>('button', { name: 'Сдвинуть фигуру влево' });
  const right = screen.getByRole<HTMLButtonElement>('button', { name: 'Сдвинуть фигуру вправо' });
  return { ...game, view, root, board, primary, left, right };
}

function expectShift(controller: GameController, baseline: GameState, kind: PieceKind, dx: number) {
  const current = controller.snapshot();
  expect(current.active?.cells).toHaveLength(4);
  expect(current).toEqual({
    ...baseline,
    active: { kind, cells: expect.arrayContaining(shifted(shapes[kind].spawn, dx).map(([x, y]) => ({ x, y }))) },
  });
}

function press(target: HTMLElement, key: string, options: KeyboardEventInit = {}, alreadyPrevented = false) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  if (alreadyPrevented) event.preventDefault();
  target.dispatchEvent(event);
  return event;
}

function outsideButton() {
  const button = document.createElement('button');
  document.body.append(button);
  return button;
}

it('ignores both movement commands in ready without consuming a piece', () => {
  const { controller, random } = newGame();
  const ready = controller.snapshot();
  expect(ready.phase).toBe('ready');
  expect(controller.dispatch('moveLeft')).toEqual(ready);
  expect(controller.dispatch('moveRight')).toEqual(ready);
  expect(random.calls).toBe(0);
});

const walls = [
  { kind: 'I', values: identityBag, leftEdge: -3, rightEdge: 3 },
  { kind: 'O', values: starts.find(start => start.kind === 'O')!.random, leftEdge: -4, rightEdge: 4 },
] as const;

it.each(walls)('$kind moves one cell up to each wall and can move back after refusals', ({ kind, values, leftEdge, rightEdge }) => {
  const { controller, random } = newGame(values);
  const baseline = controller.dispatch('start');
  expectShift(controller, baseline, kind, 0);
  for (let dx = -1; dx >= leftEdge; dx--) {
    controller.dispatch('moveLeft');
    expectShift(controller, baseline, kind, dx);
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    controller.dispatch('moveLeft');
    expectShift(controller, baseline, kind, leftEdge);
  }
  for (let dx = leftEdge + 1; dx <= rightEdge; dx++) {
    controller.dispatch('moveRight');
    expectShift(controller, baseline, kind, dx);
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    controller.dispatch('moveRight');
    expectShift(controller, baseline, kind, rightEdge);
  }
  controller.dispatch('moveLeft');
  expectShift(controller, baseline, kind, rightEdge - 1);
  expect(random.calls).toBe(6);
});

it('accepts focused movement only after start and prevents even a wall-rejected arrow', () => {
  const game = mountGame();
  const ready = game.controller.snapshot();
  expect(game.left).toBeDisabled();
  expect(game.right).toBeDisabled();
  game.left.click();
  game.right.click();
  game.board().click();
  expect(game.root).toHaveFocus();
  expect(press(game.root, 'ArrowLeft').defaultPrevented).toBe(false);
  expect(press(game.root, 'ArrowRight').defaultPrevented).toBe(false);
  expect(game.controller.snapshot()).toEqual(ready);
  expect(game.random.calls).toBe(0);

  game.primary().click();
  const baseline = game.controller.snapshot();
  expect(game.left).toBeEnabled();
  expect(game.right).toBeEnabled();
  for (const dx of [-1, -2, -3]) {
    expect(press(game.root, 'ArrowLeft', { repeat: dx !== -1 }).defaultPrevented).toBe(true);
    expectShift(game.controller, baseline, 'I', dx);
  }
  expect(press(game.root, 'ArrowLeft').defaultPrevented).toBe(true);
  expectShift(game.controller, baseline, 'I', -3);
  game.right.focus();
  game.right.click();
  expect(game.right).toHaveFocus();
  expectShift(game.controller, baseline, 'I', -2);
  expect(game.random.calls).toBe(6);
});

it('leaves outside focus, modifiers, composition, canceled events and editable inputs alone', () => {
  const game = mountGame();
  game.primary().click();
  const baseline = game.controller.snapshot();
  const ignored = (target: HTMLElement, key = 'ArrowLeft', options: KeyboardEventInit = {}, canceled = false) => {
    expect(press(target, key, options, canceled).defaultPrevented, key).toBe(canceled);
    expect(game.controller.snapshot()).toEqual(baseline);
    // Both arrows really work at the same position when the guard does not apply.
    game.root.focus();
    expect(press(game.root, 'ArrowLeft').defaultPrevented).toBe(true);
    expectShift(game.controller, baseline, 'I', -1);
    expect(press(game.root, 'ArrowRight').defaultPrevented).toBe(true);
    expectShift(game.controller, baseline, 'I', 0);
  };

  const outside = outsideButton();
  outside.focus();
  expect(outside).toHaveFocus();
  ignored(game.root); // Target inside, actual focus outside: routing alone cannot prove the guard.
  for (const flag of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing'] as const) {
    ignored(game.root, 'ArrowLeft', { [flag]: true });
  }
  ignored(game.root, 'ArrowLeft', {}, true);
  for (const key of ['ArrowUp', 'ArrowDown', 'x', 'z', 'p', 'Escape', ' ', 'Enter']) ignored(game.root, key);

  for (const tag of ['input', 'textarea', 'select'] as const) {
    const editable = document.createElement(tag);
    game.root.append(editable);
    editable.focus();
    expect(editable).toHaveFocus();
    ignored(editable);
  }
  const editor = document.createElement('div');
  editor.setAttribute('contenteditable', 'true');
  editor.tabIndex = 0;
  const child = document.createElement('span');
  editor.append(child);
  game.root.append(editor);
  editor.focus();
  expect(editor).toHaveFocus();
  ignored(child);
  expect(game.random.calls).toBe(6);
});

it('isolates two mounted games and removes both input listeners when one is disposed', () => {
  const first = mountGame();
  const second = mountGame();
  first.primary().click();
  second.primary().click();
  const originalFirst = first.controller.snapshot();
  const originalSecond = second.controller.snapshot();
  first.board().click();
  expect(first.root).toHaveFocus();
  expect(press(first.root, 'ArrowLeft').defaultPrevented).toBe(true);
  expectShift(first.controller, originalFirst, 'I', -1);
  expect(second.controller.snapshot()).toEqual(originalSecond);
  second.board().click();
  expect(second.root).toHaveFocus();
  expect(press(second.root, 'ArrowRight').defaultPrevented).toBe(true);
  expectShift(second.controller, originalSecond, 'I', 1);
  expectShift(first.controller, originalFirst, 'I', -1);

  const board = first.board();
  const restart = first.primary();
  first.view.dispose();
  first.view.dispose();
  const outside = outsideButton();
  outside.focus();
  board.click();
  expect(outside).toHaveFocus();
  first.root.focus();
  expect(first.root).toHaveFocus();
  expect(press(first.root, 'ArrowLeft').defaultPrevented).toBe(false);
  first.left.click();
  restart.click();
  expect(first.board()).toBe(board);
  expect(first.primary()).toBe(restart);
  expectShift(first.controller, originalFirst, 'I', -1);
  expect(first.random.calls).toBe(6);

  second.root.focus();
  expect(press(second.root, 'ArrowRight').defaultPrevented).toBe(true);
  expectShift(second.controller, originalSecond, 'I', 2);
  expectShift(first.controller, originalFirst, 'I', -1);
});
