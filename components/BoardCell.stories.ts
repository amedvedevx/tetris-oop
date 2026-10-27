import type { Meta, StoryObj } from '@storybook/html-vite';
import { BoardCell, type BoardCellProps, type PieceKind } from './BoardCell';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Components/BoardCell',
  tags: ['autodocs'],
  render: ({ state, piece, size = 'medium', decorative = false }) => state === 'empty'
    ? BoardCell({ state, size, decorative })
    : BoardCell({ state, piece: piece ?? 'T', size, decorative }),
  args: { state: 'empty', size: 'medium', decorative: false },
  argTypes: {
    state: { control: 'select', options: ['empty', 'active', 'locked'] },
    piece: { control: 'select', options: ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] },
    size: { control: 'select', options: ['small', 'medium', 'large', 'fluid'] },
  },
} satisfies Meta<BoardCellProps>;

export default meta;
type Story = StoryObj<BoardCellProps>;

export const Empty: Story = {};
export const Active: Story = { args: { state: 'active', piece: 'T' } };
export const Locked: Story = { args: { state: 'locked', piece: 'T' } };
export const Small: Story = { args: { state: 'locked', piece: 'I', size: 'small' } };
export const Large: Story = { args: { state: 'locked', piece: 'O', size: 'large' } };
export const Fluid: Story = { args: { state: 'locked', piece: 'J', size: 'fluid' } };
export const AllPieces: Story = {
  render: () => Wrapper({
    dir: 'row', gap: 'sm',
    children: (['I', 'O', 'T', 'S', 'Z', 'J', 'L'] satisfies PieceKind[])
      .map(piece => BoardCell({ state: 'locked', piece })),
  }),
};
export const Decorative: Story = { args: { state: 'locked', piece: 'S', decorative: true } };
