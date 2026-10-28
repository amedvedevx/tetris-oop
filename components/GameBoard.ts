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
  element.className = 'w-full max-w-board rounded-lg bg-surface-dark p-1 shadow-lg';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', ariaLabel);
  const grid = document.createElement('div');
  grid.className = 'grid aspect-[1/2] w-full grid-cols-10 grid-rows-20';
  cells.forEach((row, y) => row.forEach((content, x) => {
    const cell = BoardCell({ ...content, size: 'fluid', decorative: true });
    cell.dataset.x = String(x);
    cell.dataset.y = String(y);
    grid.append(cell);
  }));
  element.append(grid);
  return element;
}
