import { pieceKinds, type PieceKind } from './pieces';
import type { RandomSource } from './RandomSource';

export class SevenBag {
  #remaining: PieceKind[] = [];

  constructor(private readonly random: RandomSource) {}

  take(): PieceKind {
    this.refillIfEmpty();
    return this.#remaining.shift()!;
  }

  peek(): PieceKind {
    this.refillIfEmpty();
    return this.#remaining[0]!;
  }

  private refillIfEmpty(): void {
    if (this.#remaining.length > 0) return;
    const bag: PieceKind[] = [...pieceKinds];
    for (let index = bag.length - 1; index > 0; index--) {
      const value = this.random.next();
      if (!Number.isFinite(value) || value < 0 || value >= 1) {
        throw new RangeError('RandomSource must return a finite number in [0, 1)');
      }
      const other = Math.floor(value * (index + 1));
      [bag[index], bag[other]] = [bag[other]!, bag[index]!];
    }
    this.#remaining = bag;
  }
}
