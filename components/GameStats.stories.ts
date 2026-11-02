import type { Meta, StoryObj } from '@storybook/html-vite';
import { GameStats, type GameStatsProps } from './GameStats';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Blocks/GameStats', tags: ['autodocs'], render: GameStats,
  args: { score: 0, elapsedMs: 0 },
  decorators: [story => Wrapper({ maxWidth: 'board', children: [story() as HTMLElement] })],
} satisfies Meta<GameStatsProps>;
export default meta;
type Story = StoryObj<GameStatsProps>;
export const Initial: Story = {};
export const InProgress: Story = { args: { score: 1240, elapsedMs: 63_000 } };
export const SingleDigit: Story = { args: { score: 7, elapsedMs: 1000 } };
export const LargeValues: Story = { args: { score: 123456789012345, elapsedMs: 6_000_000 } };
