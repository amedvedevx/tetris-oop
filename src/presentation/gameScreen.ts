import type { CellContent } from '../../components/BoardCell';
import type { GameScreenData } from '../../components/GameScreenData';
import type { GameState } from '../application/GameController';
import { initialPieceCells } from '../domain/pieces';

/** Translate detached domain data; never put the active figure into the locked board. */
export function gameScreen(snapshot: GameState): GameScreenData {
  const cells: CellContent[][] = snapshot.board.map(row => row.map(piece =>
    piece === null ? { state: 'empty' } : { state: 'locked', piece }));
  if (snapshot.active) {
    for (const { x, y } of snapshot.active.cells) {
      cells[y]![x] = { state: 'active', piece: snapshot.active.kind };
    }
  }
  return {
    phase: snapshot.phase,
    cells,
    next: snapshot.next ? { kind: snapshot.next, cells: initialPieceCells(snapshot.next) } : null,
    metrics: { score: snapshot.score, lines: snapshot.lines, level: snapshot.level, highScore: snapshot.highScore },
  };
}
