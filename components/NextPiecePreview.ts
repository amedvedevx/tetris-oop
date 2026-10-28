import { BoardCell } from './BoardCell';
import type { PreviewPiece } from './GameScreenData';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface NextPiecePreviewProps { piece: PreviewPiece | null }

export function NextPiecePreview({ piece }: NextPiecePreviewProps): HTMLElement {
  const occupied = new Set(piece?.cells.map(({ x, y }) => `${x},${y}`));
  if (piece && (occupied.size !== 4 || piece.cells.some(({ x, y }) =>
    !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 3 || y < 0 || y > 3))) {
    throw new RangeError('Preview requires four distinct cells within a 4 by 4 area');
  }
  const preview = Wrapper({
    display: 'grid', columns: 4, gap: 'none',
    children: Array.from({ length: 16 }, (_, index) => {
      const filled = piece && occupied.has(`${index % 4},${Math.floor(index / 4)}`);
      return BoardCell(filled
        ? { state: 'locked', piece: piece.kind, size: 'fluid', decorative: true }
        : { state: 'empty', size: 'fluid', decorative: true });
    }),
  });
  // A bounded stencil shrinks with its panel when the root font grows.
  const stencil = document.createElement('div');
  stencil.className = 'w-full max-w-32 rounded-lg bg-surface-dark p-3';
  stencil.setAttribute('role', 'img');
  stencil.setAttribute('aria-label', piece ? `Следующая фигура: ${piece.kind}` : 'Следующая фигура ещё не выбрана');
  stencil.append(preview);
  return Surface({
    size: 'compact', as: 'section', ariaLabel: 'Следующая фигура',
    children: [Wrapper({ gap: 'md', children: [
      Typography({ as: 'h2', variant: 'label', text: 'Следующая фигура' }),
      stencil,
      Typography({ variant: 'caption', tone: 'muted', text: piece ? 'Одна фигура вперёд.' : 'Появится после начала партии.' }),
    ] })],
  });
}
