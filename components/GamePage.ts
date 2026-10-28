import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { GameHeader } from './GameHeader';
import type { GameAction, GameScreenData } from './GameScreenData';
import { GameStats } from './GameStats';
import { GameStatus } from './GameStatus';
import { NextPiecePreview } from './NextPiecePreview';
import { Wrapper } from './Wrapper';

export interface GamePageProps {
  data: GameScreenData;
  onAction?: (action: GameAction) => void;
}
export interface GamePageElement extends HTMLDivElement { update(data: GameScreenData): void }

export function GamePage({ data, onAction }: GamePageProps): GamePageElement {
  const notice = onAction ? undefined : 'Это демонстрация интерфейса: можно изучить поле и управление.';
  const board = Wrapper({ align: 'center', children: [GameBoard({ cells: data.cells })] });
  const stats = Wrapper({ children: [GameStats(data.metrics)] });
  const preview = Wrapper({ children: [NextPiecePreview({ piece: data.next })] });
  const status = GameStatus({ phase: data.phase, ...(notice ? { message: notice } : {}) });
  const controls = GameControls({ phase: data.phase, ...(onAction ? { onAction } : {}) });
  const element = document.createElement('div');
  element.className = 'min-h-screen bg-surface-muted';
  element.append(Wrapper({ align: 'center', children: [
    Wrapper({ as: 'main', maxWidth: 'game', width: 'full', padding: { base: 'md', md: 'xl' }, gap: 'lg', children: [
      GameHeader(),
      Wrapper({ display: 'grid', columns: { base: 1, md: 2 }, gap: 'lg', align: 'start', children: [
        Wrapper({ gap: 'lg', children: [board, status] }),
        Wrapper({ gap: 'lg', children: [
          Wrapper({ display: 'grid', columns: { base: 1, lg: 2 }, gap: 'md', align: 'start', children: [stats, preview] }),
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
