import { screen, within } from '@testing-library/dom';
import { describe, expect, it } from 'vitest';
import { GameStatus } from '../../components/GameStatus';
import type { PreviewPiece } from '../../components/GameScreenData';
import { NextPiecePreview } from '../../components/NextPiecePreview';
import { StatItem } from '../../components/StatItem';

// Coordinates are inputs; the separate literal rows are the independent oracle.
const previews: { name: string; piece: PreviewPiece; rows: readonly string[] }[] = [
  { name: 'I', piece: { kind: 'I', cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }] }, rows: ['....', 'IIII', '....', '....'] },
  { name: 'O', piece: { kind: 'O', cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, rows: ['.OO.', '.OO.', '....', '....'] },
  { name: 'T', piece: { kind: 'T', cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, rows: ['.T..', 'TTT.', '....', '....'] },
  { name: 'S', piece: { kind: 'S', cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] }, rows: ['.SS.', 'SS..', '....', '....'] },
  { name: 'Z', piece: { kind: 'Z', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, rows: ['ZZ..', '.ZZ.', '....', '....'] },
  { name: 'J', piece: { kind: 'J', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, rows: ['J...', 'JJJ.', '....', '....'] },
  { name: 'L', piece: { kind: 'L', cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, rows: ['..L.', 'LLL.', '....', '....'] },
  { name: 'noncanonical supplied stencil', piece: { kind: 'I', cells: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 3 }, { x: 3, y: 3 }] }, rows: ['I..I', '....', '....', 'I..I'] },
];

describe('composed presentation blocks', () => {
  it.each(previews)('renders $name from supplied coordinates without generating geometry', ({ piece, rows }) => {
    document.body.append(NextPiecePreview({ piece }));
    const image = screen.getByRole('img', { name: `Следующая фигура: ${piece.kind}` });
    const cells = Array.from(image.querySelectorAll<HTMLElement>('[data-state]'));
    expect(cells).toHaveLength(20);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(cells.filter(cell => cell.dataset.state === 'locked')).toHaveLength(4);
    expect(cells.filter(cell => cell.dataset.state === 'empty')).toHaveLength(16);
    const supplied = Array.from(image.querySelectorAll<HTMLElement>('[data-preview-x][data-preview-y]'));
    expect(supplied).toHaveLength(4);
    const sourceRows = Array.from({ length: 4 }, () => Array<string>(4).fill('.'));
    for (const position of supplied) {
      const cell = position.querySelector<HTMLElement>('[data-state="locked"]')!;
      expect(cell).toHaveAttribute('data-piece', piece.kind);
      sourceRows[Number(position.dataset.previewY)]![Number(position.dataset.previewX)] = cell.dataset.piece!;
    }
    expect(sourceRows.map(row => row.join(''))).toEqual(rows);
    for (const cell of cells) {
      expect(cell).toHaveAttribute('aria-hidden', 'true');
      if (cell.dataset.state === 'empty') expect(cell).not.toHaveAttribute('data-piece');
    }
  });

  it('keeps custom status messages literal and restores default details on update', () => {
    const status = GameStatus({ phase: 'ready', message: '<strong>Можно начать</strong>' });
    document.body.append(status);
    expect(screen.getByRole('status')).toBe(status);
    expect(within(status).getByText('<strong>Можно начать</strong>')).toBeVisible();
    expect(status.querySelector('strong')).toBeNull();
    status.update('paused', '<em>Продолжить позже</em>');
    expect(within(status).getByText('<em>Продолжить позже</em>')).toBeVisible();
    expect(status.querySelector('em')).toBeNull();
    status.update('running');
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveAttribute('data-phase', 'running');
    expect(within(status).getByRole('heading', { level: 2, name: 'Партия идёт' })).toBeVisible();
    expect(within(status).getByText('Собирайте полные линии и следите за следующей фигурой.')).toBeVisible();
    expect(status).not.toHaveTextContent('Продолжить позже');
  });

  it('pairs a custom StatItem label with its unchanged string value', () => {
    const item = StatItem({ label: 'Результат тренировки', value: '001 240' });
    document.body.append(item);
    expect(item.tagName).toBe('DL');
    expect(within(item).getByRole('term')).toHaveTextContent(/^Результат тренировки$/);
    expect(within(item).getByRole('definition')).toHaveTextContent(/^001 240$/);
  });
});
