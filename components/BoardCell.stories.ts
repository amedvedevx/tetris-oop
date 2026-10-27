import type { Meta, StoryObj } from '@storybook/html-vite';
import { BoardCell, boardCellOptions, type BoardCellProps } from './BoardCell';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Components/BoardCell',
  tags: ['autodocs'],
  render: ({ state, piece, size = 'medium', decorative = false }) => state === 'empty'
    ? BoardCell({ state, size, decorative })
    : BoardCell({ state, piece: piece ?? 'T', size, decorative }),
  args: { state: 'empty', size: 'medium', decorative: false },
  argTypes: {
    state: { control: 'select', options: boardCellOptions.states },
    piece: { control: 'select', options: boardCellOptions.pieces, if: { arg: 'state', neq: 'empty' } },
    size: { control: 'select', options: boardCellOptions.sizes },
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
    children: boardCellOptions.pieces.map(piece => BoardCell({ state: 'locked', piece })),
  }),
};
export const Decorative: Story = { args: { state: 'locked', piece: 'S', decorative: true } };
