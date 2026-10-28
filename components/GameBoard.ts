import { BoardCell } from './BoardCell';
import type { BoardCells } from './GameScreenData';

export interface GameBoardProps {
  cells: BoardCells;
  ariaLabel?: string;
}

export function GameBoard({ cells, ariaLabel = 'Игровое поле: 10 столбцов, 20 строк' }: GameBoardProps): HTMLDivElement {
  if (cells.length !== 20 || cells.some(row => row.length !== 10)) {
    throw new RangeError('GameBoard requires exactly 20 rows of 10 cells');
  }
  const element = document.createElement('div');
  element.className = 'grid aspect-[1/2] w-full max-w-80 grid-cols-10 grid-rows-20 rounded-sm bg-surface-dark shadow-lg ring-4 ring-surface-dark';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', ariaLabel);
  cells.forEach((row, y) => row.forEach((content, x) => {
    const cell = BoardCell({ ...content, size: 'fluid', decorative: true });
    cell.dataset.x = String(x);
    cell.dataset.y = String(y);
    element.append(cell);
  }));
  return element;
}
