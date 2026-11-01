import { pieceKinds, type PieceCells, type PieceKind } from './pieces';

export type BoardSnapshot = readonly (readonly (PieceKind | null)[])[];

export class Board {
  static readonly width = 10;
  static readonly height = 20;
  readonly #cells: (PieceKind | null)[][];

  constructor(cells?: BoardSnapshot) {
    if (cells && cells.length !== Board.height) throw new RangeError('Board requires 20 rows');
    this.#cells = Array.from({ length: Board.height }, (_, y) => {
      if (!cells) return Array<PieceKind | null>(Board.width).fill(null);
      const row = cells[y];
      if (!row || row.length !== Board.width) throw new RangeError('Board requires 10 cells per row');
      return Array.from({ length: Board.width }, (_, x) => {
        const cell = row[x];
        if (cell === undefined || (cell !== null && !pieceKinds.includes(cell))) {
          throw new RangeError('Board cells must be empty or a known piece kind');
        }
        return cell;
      });
    });
  }

  canPlace(cells: PieceCells): boolean {
    return cells.every(({ x, y }) => Number.isInteger(x) && Number.isInteger(y)
      && x >= 0 && x < Board.width && y >= 0 && y < Board.height
      && this.#cells[y]![x] === null);
  }

  snapshot(): BoardSnapshot {
    return this.#cells.map(row => [...row]);
  }
}
