import type { Meta, StoryObj } from '@storybook/html-vite';
import { GameBoard, type GameBoardProps } from './GameBoard';
import { emptyBoard, sampleBoard } from './gameShell.fixtures';

const meta = {
  title: 'Blocks/GameBoard', tags: ['autodocs'], render: GameBoard,
  args: { cells: emptyBoard() },
  argTypes: { cells: { control: 'object' } },
} satisfies Meta<GameBoardProps>;
export default meta;
type Story = StoryObj<GameBoardProps>;
export const Empty: Story = {};
export const InProgress: Story = { args: { cells: sampleBoard() } };
export const Filled: Story = {
  args: { cells: Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => ({ state: 'locked', piece: 'Z' }))) },
};
