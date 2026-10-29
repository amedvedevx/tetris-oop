export const pieceKinds = Object.freeze(['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const);
export type PieceKind = typeof pieceKinds[number];
export interface Point { readonly x: number; readonly y: number }
export type PieceCells = readonly [Point, Point, Point, Point];

// Initial geometry from game-rules.md. The bounding square matters for future rotations.
const shapes = {
  I: { size: 4, cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  O: { size: 4, cells: [[1, 0], [2, 0], [1, 1], [2, 1]] },
  T: { size: 3, cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  S: { size: 3, cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  Z: { size: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  J: { size: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  L: { size: 3, cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
} as const;

export function initialPieceCells(kind: PieceKind): PieceCells {
  // Mapping the fixed four-cell tuple preserves its length and detaches every point.
  return shapes[kind].cells.map(([x, y]) => ({ x, y })) as [Point, Point, Point, Point];
}

export function pieceSize(kind: PieceKind): number {
  return shapes[kind].size;
}
