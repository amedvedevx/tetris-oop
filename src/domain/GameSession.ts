import { Board, type BoardSnapshot } from './Board';
import type { PieceCells, PieceKind } from './pieces';
import type { RandomSource } from './RandomSource';
import { SevenBag } from './SevenBag';
import { Tetromino } from './Tetromino';

export interface GameSnapshot {
  readonly phase: 'ready' | 'running';
  readonly board: BoardSnapshot;
  readonly active: { readonly kind: PieceKind; readonly cells: PieceCells } | null;
  readonly next: PieceKind | null;
  readonly score: number;
  readonly lines: number;
  readonly level: number;
}

export class GameSession {
  #board = new Board();
  #queue: SevenBag;
  #active: Tetromino | null = null;

  constructor(private readonly random: RandomSource) {
    this.#queue = new SevenBag(random);
  }

  start(): void {
    if (!this.#active) this.beginNewGame();
  }

  restart(): void {
    if (this.#active) this.beginNewGame();
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.#active ? 'running' : 'ready',
      board: this.#board.snapshot(),
      active: this.#active ? { kind: this.#active.kind, cells: this.#active.cells() } : null,
      next: this.#active ? this.#queue.peek() : null,
      score: 0, lines: 0, level: 1,
    };
  }

  private beginNewGame(): void {
    // Build the complete new state first. A failed random source leaves the current game intact.
    const queue = new SevenBag(this.random);
    const active = new Tetromino(queue.take());
    queue.peek();
    this.#board = new Board();
    this.#queue = queue;
    this.#active = active;
  }
}
