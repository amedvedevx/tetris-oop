import type { PieceCells, PieceKind, Point } from '../pieces';

function copyCells(cells: PieceCells): PieceCells {
  return cells.map(({ x, y }) => ({ x, y })) as [Point, Point, Point, Point];
}

export abstract class Figure {
  readonly #kind: PieceKind;
  readonly #size: 3 | 4;
  readonly #localCells: PieceCells;
  readonly #position: Point;

  protected constructor(kind: PieceKind, size: 3 | 4, cells: PieceCells, position: Point = { x: 3, y: 0 }) {
    if (!Number.isSafeInteger(position.x) || !Number.isSafeInteger(position.y)) {
      throw new RangeError('Figure position requires safe integer coordinates');
    }
    this.#kind = kind;
    this.#size = size;
    this.#localCells = copyCells(cells);
    this.#position = { x: position.x, y: position.y };
  }

  get kind(): PieceKind { return this.#kind; }
  get size(): 3 | 4 { return this.#size; }

  localCells(): PieceCells {
    return copyCells(this.#localCells);
  }

  cells(): PieceCells {
    return this.#localCells.map(({ x, y }) => ({
      x: x + this.#position.x, y: y + this.#position.y,
    })) as [Point, Point, Point, Point];
  }

  moveLeft(): Figure { return this.translated(-1, 0); }
  moveRight(): Figure { return this.translated(1, 0); }
  drop(): Figure { return this.translated(0, 1); }

  protected abstract createAt(position: Point): Figure;

  private translated(dx: number, dy: number): Figure {
    return this.createAt({ x: this.#position.x + dx, y: this.#position.y + dy });
  }
}
