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

/** Prepare every replaceable part before making any visible change. */
function prepareSnapshot(data: GameScreenData) {
  return {
    board: GameBoard({ cells: data.cells }),
    stats: GameStats(data.metrics),
    preview: NextPiecePreview({ piece: data.next }),
  };
}

export function GamePage({ data, onAction, availability, statusMessage }: GamePageProps): GamePageElement {
  const notice = statusMessage ?? (onAction ? undefined : 'Это демонстрация интерфейса: можно изучить поле и управление.');
  const snapshot = prepareSnapshot(data);
  const board = Wrapper({ maxWidth: 'board', width: 'full', children: [snapshot.board] });
  const stats = Wrapper({ display: 'grid', children: [snapshot.stats] });
  const preview = Wrapper({ display: 'grid', children: [snapshot.preview] });
  const status = GameStatus({ phase: data.phase, ...(notice !== undefined ? { message: notice } : {}) });
  const controls = GameControls({ phase: data.phase, ...(onAction ? { onAction } : {}), ...(availability ? { availability } : {}) });
  const element = document.createElement('div');
  // Pointer interaction can focus the game area without adding a stop before Start in tab order.
  element.tabIndex = -1;
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
      const prepared = prepareSnapshot(next);
      board.replaceChildren(prepared.board);
      stats.replaceChildren(prepared.stats);
      preview.replaceChildren(prepared.preview);
      status.update(next.phase, notice);
      controls.update(next.phase);
    },
  });
}
