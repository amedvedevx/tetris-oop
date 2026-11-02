import { GamePlayfield } from './GamePlayfield';
import { GameControls, type GameControlsAvailability } from './GameControls';
import { GameHeader } from './GameHeader';
import type { GameAction, GameScreenData } from './GameScreenData';
import { GameStatus } from './GameStatus';
import { NextPiecePreview } from './NextPiecePreview';
import { Wrapper } from './Wrapper';

export interface GamePageProps {
  data: GameScreenData;
  onAction?: (action: GameAction) => void;
  availability?: GameControlsAvailability;
  statusMessage?: string;
}
export interface GamePageElement extends HTMLDivElement {
  update(data: GameScreenData): void;
  updateElapsedTime(elapsedMs: number): void;
}

/** Prepare every replaceable part before making any visible change. */
function prepareSnapshot(data: GameScreenData) {
  return {
    playfield: GamePlayfield({ cells: data.cells, score: data.metrics.score, elapsedMs: data.metrics.elapsedMs }),
    preview: NextPiecePreview({ piece: data.next }),
  };
}

export function GamePage({ data, onAction, availability, statusMessage }: GamePageProps): GamePageElement {
  const notice = statusMessage ?? (onAction ? undefined : 'Это демонстрация интерфейса: можно изучить поле и управление.');
  const snapshot = prepareSnapshot(data);
  let playfield = snapshot.playfield;
  const field = Wrapper({ maxWidth: 'board', width: 'full', children: [playfield] });
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
          field,
          Wrapper({ maxWidth: 'board', width: 'full', children: [status] }),
        ] }),
        Wrapper({ gap: 'lg', justify: 'between', children: [
          preview,
          controls,
        ] }),
      ] }),
    ] }),
  ] }));
  return Object.assign(element, {
    update(next: GameScreenData) {
      const prepared = prepareSnapshot(next);
      field.replaceChildren(prepared.playfield);
      playfield = prepared.playfield;
      preview.replaceChildren(prepared.preview);
      status.update(next.phase, notice);
      controls.update(next.phase);
    },
    updateElapsedTime(elapsedMs: number) { playfield.updateElapsedTime(elapsedMs); },
  });
}
