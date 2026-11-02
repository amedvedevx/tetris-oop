import { Board, type BoardSnapshot } from './Board';
import type { Clock } from './Clock';
import type { PieceCells, PieceKind } from './pieces';
import type { RandomSource } from './RandomSource';
import { SevenBag } from './SevenBag';
import type { Figure } from './figures/Figure';
import { createFigure } from './figures/createFigure';

export interface GameSnapshot {
  readonly phase: 'ready' | 'running';
  readonly board: BoardSnapshot;
  readonly active: { readonly kind: PieceKind; readonly cells: PieceCells } | null;
  readonly next: PieceKind | null;
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly elapsedMs: number;
}

export class GameSession {
  #board = new Board();
  #queue: SevenBag;
  #active: Figure | null = null;
  #startedAt: number | null = null;

  constructor(private readonly random: RandomSource, private readonly clock: Clock) {
    this.#queue = new SevenBag(random);
  }

  start(): void {
    if (!this.#active) this.beginNewGame();
  }

  restart(): void {
    if (this.#active) this.beginNewGame();
  }

  move(direction: 'left' | 'right'): void {
    if (!this.#active) return;
    const candidate = direction === 'left' ? this.#active.moveLeft() : this.#active.moveRight();
    if (this.#board.canPlace(candidate.cells())) this.#active = candidate;
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.#active ? 'running' : 'ready',
      board: this.#board.snapshot(),
      active: this.#active ? { kind: this.#active.kind, cells: this.#active.cells() } : null,
      next: this.#active ? this.#queue.peek() : null,
      score: 0, lines: 0, level: 1,
      elapsedMs: this.elapsedMs(),
    };
  }

  elapsedMs(): number {
    return this.#startedAt === null ? 0 : Math.max(0, this.timestamp() - this.#startedAt);
  }

  private timestamp(): number {
    const now = this.clock.now();
    if (!Number.isFinite(now)) throw new RangeError('Clock must return finite milliseconds');
    return now;
  }

  private beginNewGame(): void {
    // Build the complete new state first. A failed random source leaves the current game intact.
    const queue = new SevenBag(this.random);
    const active = createFigure(queue.take());
    queue.peek();
    const startedAt = this.timestamp();
    this.#board = new Board();
    this.#queue = queue;
    this.#active = active;
    this.#startedAt = startedAt;
  }
}
