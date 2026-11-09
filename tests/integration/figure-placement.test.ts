import { expect, it } from 'vitest';
import { Board } from '../../src/domain/Board';
import { createFigure } from '../../src/domain/figures/createFigure';
import { Figure } from '../../src/domain/figures/Figure';
import { IFigure } from '../../src/domain/figures/IFigure';
import { JFigure } from '../../src/domain/figures/JFigure';
import { LFigure } from '../../src/domain/figures/LFigure';
import { OFigure } from '../../src/domain/figures/OFigure';
import { SFigure } from '../../src/domain/figures/SFigure';
import { TFigure } from '../../src/domain/figures/TFigure';
import { ZFigure } from '../../src/domain/figures/ZFigure';
import type { PieceCells, PieceKind, Point } from '../../src/domain/pieces';
import { shifted } from '../fixtures/movement-data';
import { shapes, sortedCoordinates } from '../fixtures/new-game-data';

const figures = [
  ['I', IFigure, 4], ['O', OFigure, 4], ['T', TFigure, 3], ['S', SFigure, 3],
  ['Z', ZFigure, 3], ['J', JFigure, 3], ['L', LFigure, 3],
] as const;

const coordinates = (cells: PieceCells) => sortedCoordinates(cells.map(({ x, y }) => [x, y]));
const emptyBoard = () => Array.from({ length: 20 }, () => Array<PieceKind | null>(10).fill(null));

it.each(figures)('%s preserves its exact concrete class, geometry and isolation across candidates', (kind, Concrete, size) => {
  const spawned = createFigure(kind);
  expect(spawned).toBeInstanceOf(Figure);
  expect(spawned.constructor).toBe(Concrete);
  expect(coordinates(spawned.cells())).toEqual(shapes[kind].spawn);

  const origin = { x: 2, y: 3 };
  const figure = new Concrete(origin);
  const left = figure.moveLeft();
  const right = figure.moveRight();
  const down = figure.drop();
  const candidates = [[left, 1, 3], [right, 3, 3], [down, 2, 4]] as const;
  expect(new Set([figure, left, right, down]).size).toBe(4);
  const assertCandidates = () => {
    expect(coordinates(figure.cells())).toEqual(shifted(shapes[kind].local, 2, 3));
    for (const [candidate, x, y] of candidates) {
      expect(candidate.constructor).toBe(Concrete);
      expect([candidate.kind, candidate.size]).toEqual([kind, size]);
      expect(coordinates(candidate.localCells())).toEqual(shapes[kind].local);
      expect(coordinates(candidate.cells())).toEqual(shifted(shapes[kind].local, x, y));
    }
  };
  assertCandidates();

  // Attempt to change returned data; frozen copies are also a valid defense.
  origin.x = 99;
  origin.y = -99;
  for (const exposed of [figure.localCells(), figure.cells(), left.localCells(), left.cells()]) {
    Reflect.set(exposed[0], 'x', 99);
    Reflect.set(exposed, 1, { x: -99, y: 99 });
    Reflect.set(exposed, 'length', 2);
  }
  assertCandidates();
  expect(coordinates(figure.localCells())).toEqual(shapes[kind].local);
  const chained = left.drop().moveRight();
  expect(chained.constructor).toBe(Concrete);
  expect(coordinates(chained.cells())).toEqual(shifted(shapes[kind].local, 2, 4));
});

it('uses occupied O cells at both walls, even with an origin outside the board', () => {
  const board = new Board();
  const left = new OFigure({ x: -1, y: 0 });
  const right = new OFigure({ x: 7, y: 0 });
  expect(coordinates(left.cells())).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
  expect(coordinates(right.cells())).toEqual([[8, 0], [9, 0], [8, 1], [9, 1]]);
  expect(board.canPlace(left.cells())).toBe(true);
  expect(board.canPlace(right.cells())).toBe(true);
  expect(board.canPlace(left.moveLeft().cells())).toBe(false);
  expect(board.canPlace(right.moveRight().cells())).toBe(false);
  expect(board.canPlace(left.moveRight().cells())).toBe(true);
  expect(board.canPlace(right.moveLeft().cells())).toBe(true);
});

it('accepts the first and last occupied rows and rejects crossing either vertical edge', () => {
  const board = new Board();
  const top = new IFigure({ x: 3, y: -1 });
  const bottom = new IFigure({ x: 3, y: 18 });
  expect(coordinates(top.cells())).toEqual([[3, 0], [4, 0], [5, 0], [6, 0]]);
  expect(coordinates(bottom.cells())).toEqual([[3, 19], [4, 19], [5, 19], [6, 19]]);
  expect(board.canPlace(top.cells())).toBe(true);
  expect(board.canPlace(bottom.cells())).toBe(true);
  expect(board.canPlace(new IFigure({ x: 3, y: -2 }).cells())).toBe(false);
  expect(board.canPlace(bottom.drop().cells())).toBe(false);
});

it('rejects a locked cell at any of the four candidate positions but allows holes', () => {
  const figure = new TFigure();
  const moved = figure.moveRight().cells();
  const occupied = [[5, 0], [4, 1], [5, 1], [6, 1]] as const;
  expect(coordinates(moved)).toEqual(occupied);
  expect(new Board().canPlace(moved)).toBe(true);
  for (const [x, y] of occupied) {
    const cells = emptyBoard();
    cells[y]![x] = 'Z';
    expect(new Board(cells).canPlace(moved), `locked cell at (${x}, ${y})`).toBe(false);
  }
  const cells = emptyBoard();
  cells[0]![3] = 'Z';
  cells[0]![5] = 'J';
  const board = new Board(cells);
  expect(board.canPlace(figure.cells())).toBe(true);
  expect(board.canPlace(moved)).toBe(false);
  expect(board.canPlace(figure.drop().cells())).toBe(true);
  cells[2]![3] = 'L';
  expect(new Board(cells).canPlace(figure.drop().cells())).toBe(false);
});

it('does not let constructor input or returned rows change collision decisions', () => {
  const input = emptyBoard();
  input[0]![5] = 'Z';
  const board = new Board(input);
  const figure = new TFigure();
  const blocked = figure.moveRight().cells();
  expect(board.canPlace(blocked)).toBe(false);
  input[0]![5] = null;
  input[1]![4] = 'J';
  const snapshot = board.snapshot();
  expect(snapshot[0]?.[5]).toBe('Z');
  Reflect.set(snapshot[0]!, 5, null);
  Reflect.set(snapshot[1]!, 4, 'J');
  Reflect.set(snapshot, 'length', 0);
  expect(board.canPlace(blocked)).toBe(false);
  expect(board.canPlace(figure.cells())).toBe(true);
  expect(board.snapshot()).toHaveLength(20);
});

it('rejects a wrong-sized, sparse, or unknown-kind board input', () => {
  const shortRow = emptyBoard();
  shortRow[0]!.pop();
  const sparseRow = emptyBoard();
  delete sparseRow[0]![4];
  const sparseBoard = emptyBoard();
  delete sparseBoard[1];
  const unknown = emptyBoard();
  Reflect.set(unknown[0]!, 0, 'unknown');
  for (const invalid of [emptyBoard().slice(1), shortRow, sparseRow, sparseBoard, unknown]) {
    expect(() => new Board(invalid)).toThrow(RangeError);
  }
});

it('rejects non-integer and non-finite coordinates even when the other three cells fit', () => {
  const board = new Board();
  const cells = new OFigure({ x: 0, y: 0 }).cells();
  expect(board.canPlace(cells)).toBe(true);
  const invalid: Point[] = [
    { x: 1.5, y: 1 }, { x: 1, y: 1.5 }, { x: NaN, y: 1 }, { x: 1, y: Infinity },
  ];
  for (const point of invalid) expect(board.canPlace([cells[0], cells[1], cells[2], point])).toBe(false);
});
