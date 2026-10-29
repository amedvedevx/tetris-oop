import { GameBoard } from './GameBoard';
import { GameControls, type GameControlsAvailability } from './GameControls';
import { GameHeader } from './GameHeader';
import type { GameAction, GameScreenData } from './GameScreenData';
import { GameStats } from './GameStats';
import { GameStatus } from './GameStatus';
import { NextPiecePreview } from './NextPiecePreview';
import { Wrapper } from './Wrapper';

export interface GamePageProps {
  data: GameScreenData;
  onAction?: (action: GameAction) => void;
  availability?: GameControlsAvailability;
  statusMessage?: string;
}
export interface GamePageElement extends HTMLDivElement { update(data: GameScreenData): void }

export function GamePage({ data, onAction, availability, statusMessage }: GamePageProps): GamePageElement {
  const notice = statusMessage ?? (onAction ? undefined : 'Это демонстрация интерфейса: можно изучить поле и управление.');
  const board = Wrapper({ maxWidth: 'board', width: 'full', children: [GameBoard({ cells: data.cells })] });
  const stats = Wrapper({ display: 'grid', children: [GameStats(data.metrics)] });
  const preview = Wrapper({ display: 'grid', children: [NextPiecePreview({ piece: data.next })] });
  const status = GameStatus({ phase: data.phase, ...(notice !== undefined ? { message: notice } : {}) });
  const controls = GameControls({ phase: data.phase, ...(onAction ? { onAction } : {}), ...(availability ? { availability } : {}) });
  const element = document.createElement('div');
  element.className = 'min-h-screen bg-surface-muted';
  element.append(Wrapper({ align: 'center', children: [
    Wrapper({ as: 'main', maxWidth: 'game', width: 'full', padding: { base: 'md', md: 'xl' }, gap: 'lg', children: [
      GameHeader(),
      Wrapper({ display: 'grid', columns: { base: 1, md: 2 }, gap: 'lg', children: [
        Wrapper({ gap: 'lg', align: 'center', justify: 'between', children: [
          board,
          Wrapper({ maxWidth: 'board', width: 'full', children: [status] }),
        ] }),
        Wrapper({ gap: 'lg', justify: 'between', children: [
          Wrapper({ display: 'grid', columns: { base: 1, lg: 2 }, gap: 'md', children: [stats, preview] }),
          controls,
        ] }),
      ] }),
    ] }),
  ] }));
  return Object.assign(element, {
    update(next: GameScreenData) {
      // Validate board and preview shapes before committing their DOM replacements.
      const nextBoard = GameBoard({ cells: next.cells });
      const nextStats = GameStats(next.metrics);
      const nextPreview = NextPiecePreview({ piece: next.next });
      board.replaceChildren(nextBoard);
      stats.replaceChildren(nextStats);
      preview.replaceChildren(nextPreview);
      status.update(next.phase, notice);
      controls.update(next.phase);
    },
  });
}
