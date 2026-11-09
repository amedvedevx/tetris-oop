import type { Meta, StoryObj } from '@storybook/html-vite';
import { GamePlayfield, type GamePlayfieldProps } from './GamePlayfield';
import { emptyBoard, sampleBoard } from './gameShell.fixtures';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Blocks/GamePlayfield', tags: ['autodocs'], render: GamePlayfield,
  args: { cells: emptyBoard(), score: 0, elapsedMs: 0 },
  decorators: [story => Wrapper({ maxWidth: 'board', children: [story() as HTMLElement] })],
} satisfies Meta<GamePlayfieldProps>;
export default meta;
type Story = StoryObj<GamePlayfieldProps>;
export const Ready: Story = {};
export const Running: Story = { args: { cells: sampleBoard(), score: 1240, elapsedMs: 3000 } };
export const LargeValues: Story = { args: { score: 123456789012345, elapsedMs: 6_000_000 } };
