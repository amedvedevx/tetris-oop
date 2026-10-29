import type { Meta, StoryObj } from '@storybook/html-vite';
import { GameStats } from './GameStats';
import type { GameMetrics } from './GameScreenData';

const meta = {
  title: 'Blocks/GameStats', tags: ['autodocs'], render: GameStats,
  args: { score: 0, lines: 0, level: 1, highScore: 0 },
} satisfies Meta<GameMetrics>;
export default meta;
type Story = StoryObj<GameMetrics>;
export const Initial: Story = {};
export const InProgress: Story = { args: { score: 1240, lines: 8, highScore: 6800 } };
export const LargeValues: Story = { args: { score: 123456789012345, lines: 123456, level: 12345, highScore: 999999999999999 } };
