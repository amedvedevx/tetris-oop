import { GameBoard } from './GameBoard';
import type { BoardCells } from './GameScreenData';
import { GameStats, type GameStatsProps } from './GameStats';

export interface GamePlayfieldProps extends GameStatsProps { readonly cells: BoardCells }
export interface GamePlayfieldElement extends HTMLDivElement { updateElapsedTime(elapsedMs: number): void }

export function GamePlayfield({ cells, score, elapsedMs }: GamePlayfieldProps): GamePlayfieldElement {
  const board = GameBoard({ cells, variant: 'embedded' });
  const stats = GameStats({ score, elapsedMs });
  const element = document.createElement('div');
  element.className = 'w-full rounded-lg bg-surface-dark shadow-lg';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', 'Игровая область');
  element.append(board, stats);
  return Object.assign(element, {
    updateElapsedTime(elapsedMs: number) { stats.updateElapsedTime(elapsedMs); },
  });
}
