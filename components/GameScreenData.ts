import type { CellContent, PieceKind } from './BoardCell';

/** Presentation data only. The presentation adapter translates domain snapshots into this contract. */
export const gamePhases = ['ready', 'running', 'paused', 'gameOver'] as const;
export type GamePhase = typeof gamePhases[number];
export type GameAction = 'start' | 'pause' | 'resume' | 'restart';
export type BoardCells = readonly (readonly CellContent[])[];
export interface PreviewPoint { readonly x: number; readonly y: number }
export interface PreviewPiece {
  readonly kind: PieceKind;
  readonly cells: readonly [PreviewPoint, PreviewPoint, PreviewPoint, PreviewPoint];
}
export interface GameMetrics {
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly highScore: number;
}
export interface GameScreenData {
  readonly phase: GamePhase;
  readonly cells: BoardCells;
  readonly next: PreviewPiece | null;
  readonly metrics: GameMetrics;
}
