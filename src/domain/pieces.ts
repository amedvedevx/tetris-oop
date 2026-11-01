export const pieceKinds = Object.freeze(['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const);
export type PieceKind = typeof pieceKinds[number];
export interface Point { readonly x: number; readonly y: number }
export type PieceCells = readonly [Point, Point, Point, Point];
