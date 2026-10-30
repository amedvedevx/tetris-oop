import type { PieceKind } from '../../src/domain/pieces';

export type Coordinates = readonly (readonly [number, number])[];
export interface ExpectedShape {
  readonly local: Coordinates;
  readonly spawn: Coordinates;
  readonly origin: readonly [number, number];
  readonly offsets: Coordinates;
}

// Hand-authored expectations from game-rules.md, never imported from production geometry.
export const shapes: Record<PieceKind, ExpectedShape> = {
  I: { local: [[0, 1], [1, 1], [2, 1], [3, 1]], spawn: [[3, 1], [4, 1], [5, 1], [6, 1]], origin: [0, 1.5], offsets: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  O: { local: [[1, 0], [2, 0], [1, 1], [2, 1]], spawn: [[4, 0], [5, 0], [4, 1], [5, 1]], origin: [1, 1], offsets: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  T: { local: [[1, 0], [0, 1], [1, 1], [2, 1]], spawn: [[4, 0], [3, 1], [4, 1], [5, 1]], origin: [0.5, 1], offsets: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  S: { local: [[1, 0], [2, 0], [0, 1], [1, 1]], spawn: [[4, 0], [5, 0], [3, 1], [4, 1]], origin: [0.5, 1], offsets: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  Z: { local: [[0, 0], [1, 0], [1, 1], [2, 1]], spawn: [[3, 0], [4, 0], [4, 1], [5, 1]], origin: [0.5, 1], offsets: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  J: { local: [[0, 0], [0, 1], [1, 1], [2, 1]], spawn: [[3, 0], [3, 1], [4, 1], [5, 1]], origin: [0.5, 1], offsets: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  L: { local: [[2, 0], [0, 1], [1, 1], [2, 1]], spawn: [[5, 0], [3, 1], [4, 1], [5, 1]], origin: [0.5, 1], offsets: [[2, 0], [0, 1], [1, 1], [2, 1]] },
};

// Literal midpoint inputs for seven independently checked cyclic bag orders (shuffle indices 6→1).
export const starts: { kind: PieceKind; next: PieceKind; random: readonly number[] }[] = [
  { kind: 'I', next: 'O', random: [13 / 14, 11 / 12, 9 / 10, 7 / 8, 5 / 6, 3 / 4] },
  { kind: 'O', next: 'T', random: [1 / 14, 1 / 12, 1 / 10, 1 / 8, 1 / 6, 1 / 4] },
  { kind: 'T', next: 'S', random: [3 / 14, 1 / 12, 3 / 10, 1 / 8, 1 / 2, 1 / 4] },
  { kind: 'S', next: 'Z', random: [5 / 14, 1 / 4, 1 / 10, 5 / 8, 1 / 2, 1 / 4] },
  { kind: 'Z', next: 'J', random: [1 / 2, 5 / 12, 3 / 10, 1 / 8, 1 / 6, 1 / 4] },
  { kind: 'J', next: 'L', random: [9 / 14, 7 / 12, 1 / 2, 3 / 8, 1 / 6, 1 / 4] },
  { kind: 'L', next: 'I', random: [11 / 14, 3 / 4, 7 / 10, 5 / 8, 1 / 2, 1 / 4] },
];

export const upper = 0.9999999999999999; // 1 - Number.EPSILON / 2, the largest representable number below 1.
export const identityBag = [upper, upper, upper, upper, upper, upper] as const;
export const lBag = [0, upper, upper, upper, upper, upper] as const;
export const jBag = [upper, 0, upper, upper, upper, upper] as const;
export const zBag = [upper, upper, 0, upper, upper, upper] as const;
export const browserSequence = [...identityBag, ...lBag, ...jBag, ...zBag];

export function sortedCoordinates(points: Coordinates): number[][] {
  return points.map(([x, y]) => [x, y]).sort((a, b) => a[1]! - b[1]! || a[0]! - b[0]!);
}
