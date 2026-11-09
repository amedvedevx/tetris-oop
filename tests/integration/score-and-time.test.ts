import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { GamePage } from '../../components/GamePage';
import { GameStats } from '../../components/GameStats';
import { GameController } from '../../src/application/GameController';
import { GameSession } from '../../src/domain/GameSession';
import { GameView } from '../../src/presentation/GameView';
import { identityBag, jBag, lBag, upper } from '../fixtures/new-game-data';
import { ManualClock } from '../fixtures/ManualClock';
import { ManualTicker } from '../fixtures/ManualTicker';
import { ScriptedRandom } from '../fixtures/ScriptedRandom';
import { replacementScreen, suppliedScreen } from './game-screen-fixtures';

const views: GameView[] = [];
const observers: MutationObserver[] = [];

afterEach(() => {
  observers.splice(0).forEach(observer => observer.disconnect());
  views.splice(0).forEach(view => view.dispose());
});

function readouts(panel: ParentNode) {
  return Array.from(panel.querySelectorAll('dl'), pair => [
    pair.querySelector('dt')?.textContent, pair.querySelector('dd')?.textContent,
  ]);
}

function observe(root: HTMLElement) {
  // The manual refresh and native click dispatch synchronously. Read before any await.
  const observer = new MutationObserver(() => {});
  observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
  observers.push(observer);
  return observer;
}

function createGame({
  values = [...identityBag, ...lBag, ...jBag],
  clock = new ManualClock(83_456),
  ticker = new ManualTicker(),
  running = false,
}: {
  values?: readonly (number | Error)[];
  clock?: ManualClock;
  ticker?: ManualTicker;
  running?: boolean;
} = {}) {
  const random = new ScriptedRandom(values);
  const controller = new GameController(new GameSession(random, clock), 9800);
  if (running) controller.dispatch('start');
  const view = new GameView(controller, ticker);
  views.push(view);
  document.body.append(view.element);
  const screen = within(view.element);
  const primary = () => screen.getByRole<HTMLButtonElement>('button', { name: /^(Начать игру|Начать заново)$/ });
  const panel = () => screen.getByRole('region', { name: 'Показатели партии' });
  const expectTime = (time: string) => expect(readouts(panel())).toEqual([['score', '0000'], ['time', time]]);
  return { random, controller, clock, ticker, view, screen, primary, panel, expectTime };
}

function expectClickError(button: HTMLButtonElement, failure: Error) {
  const errors: unknown[] = [];
  const record = (event: ErrorEvent) => {
    errors.push(event.error);
    if (event.error === failure) event.preventDefault();
  };
  window.addEventListener('error', record);
  try {
    button.click();
  } finally {
    window.removeEventListener('error', record);
  }
  expect(errors).toHaveLength(1);
  expect(errors[0]).toBe(failure);
}

it('starts at zero after idle time and displays whole seconds and untruncated minutes', () => {
  const game = createGame();
  game.clock.advance(90_000);
  game.ticker.tick();
  expect(game.controller.dispatch('restart')).toMatchObject({ phase: 'ready', elapsedMs: 0 });
  game.expectTime('00:00');
  expect(game.ticker.activeCount).toBe(0);
  expect(game.random.calls).toBe(0);

  game.primary().click();
  expect(game.controller.snapshot().phase).toBe('running');
  expect(game.ticker.activeCount).toBe(1);
  const cases = [
    [0, '00:00'], [999, '00:00'], [1000, '00:01'], [59_999, '00:59'],
    [60_000, '01:00'], [6_000_000, '100:00'],
  ] as const;
  let previous = 0;
  for (const [elapsedMs, label] of cases) {
    game.clock.advance(elapsedMs - previous);
    previous = elapsedMs;
    expect(game.controller.snapshot().elapsedMs).toBe(elapsedMs);
    game.ticker.tick();
    game.expectTime(label);
  }
  expect(game.random.calls).toBe(6);
});

it('uses the clock for one late refresh and never advances from repeated callbacks alone', () => {
  const game = createGame();
  game.primary().click();
  game.clock.advance(61_234);
  expect(game.controller.elapsedMs()).toBe(61_234);
  game.expectTime('00:00');
  game.ticker.tick();
  game.expectTime('01:01');
  for (let refresh = 0; refresh < 8; refresh++) game.ticker.tick();
  game.expectTime('01:01');
  expect(game.random.calls).toBe(6);
});

it('keeps the origin during guarded start and movement, and resets it on each restart', () => {
  const game = createGame();
  game.primary().click();
  game.clock.advance(1234);
  expect(game.controller.dispatch('start').elapsedMs).toBe(1234);

  const move = game.screen.getByRole<HTMLButtonElement>('button', { name: 'Сдвинуть фигуру влево' });
  move.click();
  expect(game.controller.snapshot().active?.cells[0]).toEqual({ x: 2, y: 1 });
  expect(game.controller.elapsedMs()).toBe(1234);
  move.click();
  move.click();
  const atWall = game.controller.snapshot().active;
  expect(atWall?.cells[0]).toEqual({ x: 0, y: 1 });
  game.clock.advance(1000);
  move.click();
  expect(game.controller.snapshot()).toMatchObject({ active: atWall, elapsedMs: 2234 });
  game.expectTime('00:02');
  expect(game.ticker.activeCount).toBe(1);
  expect(game.random.calls).toBe(6);

  for (const calls of [12, 18]) {
    game.primary().click();
    game.expectTime('00:00');
    expect(game.controller.elapsedMs()).toBe(0);
    expect(game.ticker.activeCount).toBe(1);
    expect(game.random.calls).toBe(calls);
    game.clock.advance(1000);
    game.ticker.tick();
    game.expectTime('00:01');
  }
});

it.each([[7, '0007'], [12_345, '12345']] as const)('displays supplied score %i with at least four digits', (score, label) => {
  const panel = GameStats({ score, elapsedMs: 0 });
  expect(readouts(panel)).toEqual([['score', label], ['time', '00:00']]);
});

it('leaves the ready timer stopped when start fails through the button, then starts on retry', () => {
  const failure = new Error('Initial bag unavailable');
  const game = createGame({ values: [upper, upper, failure, ...lBag] });
  const before = game.controller.snapshot();
  const primary = game.primary();
  const observer = observe(game.view.element);

  expectClickError(primary, failure);
  game.clock.advance(5000);
  game.ticker.tick();
  expect(observer.takeRecords()).toEqual([]);
  expect(game.controller.snapshot()).toEqual(before);
  expect(game.primary()).toBe(primary);
  game.expectTime('00:00');
  expect(game.ticker.activeCount).toBe(0);
  expect(game.random.calls).toBe(3);

  primary.click();
  expect(game.controller.snapshot()).toMatchObject({ phase: 'running', active: { kind: 'L' }, elapsedMs: 0 });
  expect(game.ticker.activeCount).toBe(1);
  expect(game.random.calls).toBe(9);
  game.clock.advance(1000);
  game.ticker.tick();
  game.expectTime('00:01');
});

it('retains the running game, focus and clock after a failed restart through the button', () => {
  const failure = new Error('Replacement bag unavailable');
  const game = createGame({ values: [...identityBag, upper, upper, failure, ...lBag] });
  game.primary().click();
  game.screen.getByRole<HTMLButtonElement>('button', { name: 'Сдвинуть фигуру влево' }).click();
  game.clock.advance(12_345);
  game.ticker.tick();
  game.expectTime('00:12');
  const before = game.controller.snapshot();
  expect(before.active?.cells[0]).toEqual({ x: 2, y: 1 });
  const primary = game.primary();
  primary.focus();
  const observer = observe(game.view.element);

  expectClickError(primary, failure);
  expect(observer.takeRecords()).toEqual([]);
  expect(game.primary()).toBe(primary);
  expect(primary).toHaveFocus();
  expect(game.controller.snapshot()).toEqual(before);
  expect(game.ticker.activeCount).toBe(1);
  expect(game.random.calls).toBe(9);

  game.clock.advance(2000);
  game.ticker.tick();
  expect(game.controller.snapshot()).toEqual({ ...before, elapsedMs: 14_345 });
  game.expectTime('00:14');

  primary.click();
  expect(game.controller.snapshot()).toMatchObject({ active: { kind: 'L' }, elapsedMs: 0 });
  game.expectTime('00:00');
  expect(game.ticker.activeCount).toBe(1);
  expect(game.random.calls).toBe(15);
});

it('does not commit a replacement game when its start timestamp is invalid', () => {
  const game = createGame({ running: true });
  game.clock.advance(4567);
  const before = game.controller.snapshot();
  const timestamp = vi.spyOn(game.clock, 'now').mockReturnValueOnce(NaN);
  try {
    expect(() => game.controller.dispatch('restart')).toThrow(RangeError);
  } finally {
    timestamp.mockRestore();
  }
  expect(game.controller.snapshot()).toEqual(before);
  game.clock.advance(1000);
  game.ticker.tick();
  game.expectTime('00:05');
  game.primary().click();
  expect(game.controller.snapshot()).toMatchObject({ phase: 'running', elapsedMs: 0 });
  game.expectTime('00:00');
});

it('keeps only live subscriptions and isolates restart and disposal with a shared ticker', () => {
  const ticker = new ManualTicker();
  const first = createGame({ ticker });
  first.primary().click();
  first.clock.advance(3000);
  const second = createGame({ ticker, clock: new ManualClock(91_000), running: true });
  expect(ticker.activeCount).toBe(2);
  first.clock.advance(2000);
  second.clock.advance(2000);
  ticker.tick();
  first.expectTime('00:05');
  second.expectTime('00:02');

  first.primary().click();
  expect(ticker.activeCount).toBe(2);
  first.expectTime('00:00');
  second.expectTime('00:02');
  const pending = ticker.queuedTick();
  first.view.dispose();
  first.view.dispose();
  expect(ticker.activeCount).toBe(1);

  const before = first.controller.snapshot();
  const observer = observe(first.view.element);
  first.clock.advance(10_000);
  second.clock.advance(2000);
  pending();
  first.primary().click();
  expect(observer.takeRecords()).toEqual([]);
  first.expectTime('00:00');
  expect(first.controller.snapshot()).toEqual({ ...before, elapsedMs: 10_000 });
  expect(first.random.calls).toBe(12);
  second.expectTime('00:04');
  second.clock.advance(1000);
  ticker.tick();
  second.expectTime('00:05');
  second.view.dispose();
  expect(ticker.activeCount).toBe(0);
});

it('refreshes only time text, skips same-second writes, and keeps the focused restart working', async () => {
  const user = userEvent.setup();
  const game = createGame();
  const primary = game.primary();
  await user.click(primary);
  expect(primary).toHaveFocus();
  const time = game.panel().querySelectorAll('dd')[1]!;
  const observer = observe(game.view.element);

  game.clock.advance(999);
  game.ticker.tick();
  game.expectTime('00:00');
  expect(observer.takeRecords()).toEqual([]);

  game.clock.advance(1);
  game.ticker.tick();
  game.expectTime('00:01');
  const changes = observer.takeRecords();
  expect(changes.length).toBeGreaterThan(0);
  for (const change of changes) {
    expect(time.contains(change.target)).toBe(true);
    expect(change.type === 'characterData' || (change.type === 'childList'
      && [...change.addedNodes, ...change.removedNodes].every(node => node.nodeType === Node.TEXT_NODE))).toBe(true);
  }
  expect(game.panel().querySelectorAll('dd')[1]).toBe(time);
  expect(game.primary()).toBe(primary);
  expect(primary).toHaveFocus();
  expect(game.random.calls).toBe(6);

  await user.keyboard('{Enter}');
  expect(game.controller.snapshot()).toMatchObject({ active: { kind: 'L' }, elapsedMs: 0 });
  expect(game.primary()).toBe(primary);
  expect(primary).toHaveFocus();
  expect(game.random.calls).toBe(12);
  game.expectTime('00:00');
});

it('rejects invalid time data before changing the page and refreshes the replacement panel', () => {
  const page = GamePage({ data: suppliedScreen() });
  document.body.append(page);
  const panel = () => within(page).getByRole('region', { name: 'Показатели партии' });
  const original = panel();
  const observer = observe(page);
  expect(() => page.updateElapsedTime(-1)).toThrow(RangeError);
  expect(() => page.update(replacementScreen({ metrics: { score: 77, elapsedMs: NaN } }))).toThrow(RangeError);
  expect(observer.takeRecords()).toEqual([]);
  expect(panel()).toBe(original);
  expect(readouts(panel())).toEqual([['score', '1240'], ['time', '01:01']]);

  page.update(replacementScreen());
  expect(panel()).not.toBe(original);
  expect(readouts(panel())).toEqual([['score', '7700'], ['time', '02:05']]);
  page.updateElapsedTime(126_500);
  expect(readouts(panel())).toEqual([['score', '7700'], ['time', '02:06']]);
});
