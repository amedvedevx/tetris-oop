import type { PieceKind } from './pieces';

export type BoardSnapshot = readonly (readonly (PieceKind | null)[])[];

export class Board {
  static readonly width = 10;
  static readonly height = 20;
  readonly #cells: (PieceKind | null)[][] = Array.from(
    { length: Board.height }, () => Array<PieceKind | null>(Board.width).fill(null),
  );

  snapshot(): BoardSnapshot {
    return this.#cells.map(row => [...row]);
  }
}
