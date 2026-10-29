import { initialPieceCells, pieceSize, type PieceCells, type PieceKind, type Point } from './pieces';

export class Tetromino {
  readonly size: number;

  constructor(readonly kind: PieceKind) {
    this.size = pieceSize(kind);
  }

  cells(): PieceCells {
    return initialPieceCells(this.kind).map(({ x, y }) => ({ x: x + 3, y })) as [Point, Point, Point, Point];
  }
}
