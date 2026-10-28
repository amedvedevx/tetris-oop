import type { BoardCells, GameScreenData, PreviewPiece } from './GameScreenData';

export function emptyBoard(): BoardCells {
  return Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => ({ state: 'empty' as const })));
}

/** Hand-authored presentation fixtures, not a figure generator or game implementation. */
export const previewPieces: readonly PreviewPiece[] = [
  { kind: 'I', cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }] },
  { kind: 'O', cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { kind: 'T', cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { kind: 'S', cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { kind: 'Z', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { kind: 'J', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { kind: 'L', cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
];

export function sampleBoard(): BoardCells {
  return Array.from({ length: 20 }, (_, y) => Array.from({ length: 10 }, (_, x) => {
    if ((y === 3 && x === 4) || (y === 4 && x >= 3 && x <= 5)) return { state: 'active' as const, piece: 'T' as const };
    if (y >= 18 && x !== 4 && x !== 5) return { state: 'locked' as const, piece: x < 4 ? 'J' as const : 'L' as const };
    if (y === 17 && x === 8) return { state: 'locked' as const, piece: 'L' as const };
    return { state: 'empty' as const };
  }));
}

export function readyScreen(): GameScreenData {
  return { phase: 'ready', cells: emptyBoard(), next: null, metrics: { score: 0, lines: 0, level: 1, highScore: 0 } };
}

export function runningScreen(): GameScreenData {
  return { phase: 'running', cells: sampleBoard(), next: previewPieces[2]!, metrics: { score: 1240, lines: 8, level: 1, highScore: 6800 } };
}

export function gameOverScreen(): GameScreenData {
  const screen = runningScreen();
  return {
    ...screen,
    phase: 'gameOver',
    cells: screen.cells.map(row => row.map(cell => cell.state === 'active' ? { state: 'empty' } : cell)),
  };
}
