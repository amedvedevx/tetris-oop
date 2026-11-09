import type { Coordinates } from './new-game-data';

/** Translate hand-authored expected coordinates, never a production snapshot. */
export function shifted(points: Coordinates, dx: number, dy = 0): Coordinates {
  return points.map(([x, y]) => [x + dx, y + dy]);
}
