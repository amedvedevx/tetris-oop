export type PieceKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type CellContent = { state: 'empty'; piece?: never }
  | { state: 'active' | 'locked'; piece: PieceKind };

export type BoardCellProps = CellContent & {
  size?: 'small' | 'medium' | 'large' | 'fluid';
  decorative?: boolean;
};

const colors: Record<PieceKind, string> = {
  I: 'border-piece-i bg-piece-i',
  O: 'border-piece-o bg-piece-o',
  T: 'border-piece-t bg-piece-t',
  S: 'border-piece-s bg-piece-s',
  Z: 'border-piece-z bg-piece-z',
  J: 'border-piece-j bg-piece-j',
  L: 'border-piece-l bg-piece-l',
};
const sizes = {
  small: 'size-4', medium: 'size-6', large: 'size-8', fluid: 'w-full',
};

export function BoardCell(props: BoardCellProps): HTMLDivElement {
  const { state, size = 'medium', decorative = false } = props;
  const element = document.createElement('div');
  element.className = [
    'inline-block aspect-square shrink-0 rounded-sm border', sizes[size],
    state === 'empty' ? 'border-line/30 bg-surface-dark' : colors[props.piece],
    state === 'active' ? 'ring-2 ring-inset ring-inverse/75' : '',
  ].join(' ');
  element.dataset.state = state;
  if (state !== 'empty') element.dataset.piece = props.piece;
  if (decorative) {
    element.setAttribute('aria-hidden', 'true');
  } else {
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', state === 'empty'
      ? 'Пустая клетка'
      : `${state === 'active' ? 'Активный' : 'Закреплённый'} блок ${props.piece}`);
  }
  return element;
}
