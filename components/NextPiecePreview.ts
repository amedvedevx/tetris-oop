import { BoardCell } from './BoardCell';
import type { PreviewPiece } from './GameScreenData';
import { Surface } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

export interface NextPiecePreviewProps { piece: PreviewPiece | null }

function centeredPositions(cells: PreviewPiece['cells']) {
  const occupied = new Set(cells.map(({ x, y }) => `${x},${y}`));
  if (occupied.size !== 4 || cells.some(({ x, y }) =>
    !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 3 || y < 0 || y > 3)) {
    throw new RangeError('Preview requires four distinct cells within a 4 by 4 area');
  }
  const xs = cells.map(cell => cell.x);
  const ys = cells.map(cell => cell.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left + 1;
  const height = Math.max(...ys) - top + 1;
  // Half-cell tracks center odd and even bounding dimensions without changing input geometry.
  return cells.map(({ x, y }) => ({
    x, y, column: 5 - width + (x - left) * 2, row: 5 - height + (y - top) * 2,
  }));
}

export function NextPiecePreview({ piece }: NextPiecePreviewProps): HTMLElement {
  const positions = piece ? centeredPositions(piece.cells) : [];
  const background = Wrapper({
    display: 'grid', columns: 4, gap: 'none',
    children: Array.from({ length: 16 }, () => BoardCell({ state: 'empty', size: 'fluid', decorative: true })),
  });
  const preview = document.createElement('div');
  preview.className = 'relative';
  preview.append(background);
  if (piece) {
    const figure = document.createElement('div');
    figure.className = 'absolute inset-0 grid grid-cols-8 grid-rows-8';
    for (const { x, y, column, row } of positions) {
      const position = document.createElement('div');
      position.className = 'min-w-0';
      position.dataset.previewX = String(x);
      position.dataset.previewY = String(y);
      position.style.gridColumn = `${column} / span 2`;
      position.style.gridRow = `${row} / span 2`;
      position.append(BoardCell({ state: 'locked', piece: piece.kind, size: 'fluid', decorative: true }));
      figure.append(position);
    }
    preview.append(figure);
  }
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
      Wrapper({ align: 'center', children: [stencil] }),
      Typography({ variant: 'caption', tone: 'muted', text: piece ? 'Одна фигура вперёд.' : 'Появится после начала партии.' }),
    ] })],
  });
}
