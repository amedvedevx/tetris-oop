import { initialPieceCells, pieceSize, type PieceCells, type PieceKind, type Point } from './pieces';

export class Tetromino {
  readonly size: number;

  constructor(readonly kind: PieceKind, private readonly x = 3, private readonly y = 0) {
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
      throw new RangeError('Piece position requires safe integer coordinates');
    }
    this.size = pieceSize(kind);
  }

  cells(): PieceCells {
    return initialPieceCells(this.kind).map(({ x, y }) => ({ x: x + this.x, y: y + this.y })) as [Point, Point, Point, Point];
  }

  translated(dx: number, dy: number): Tetromino {
    return new Tetromino(this.kind, this.x + dx, this.y + dy);
  }
}
