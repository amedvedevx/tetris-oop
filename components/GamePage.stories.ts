import type { Meta, StoryObj } from '@storybook/html-vite';
import { action } from 'storybook/actions';
import { GamePage, type GamePageProps } from './GamePage';
import { gameOverScreen, readyScreen, runningScreen } from './gameShell.fixtures';

const meta = {
  title: 'Pages/GamePage', tags: ['autodocs'], render: GamePage,
  args: { data: readyScreen() },
  argTypes: {
    data: { control: 'object' }, onAction: { control: false },
    availability: { control: 'object' }, statusMessage: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen', fullPage: true,
    docs: { description: { component: 'Content-sized panels align in the two-column layout. Status follows the board width; the status and controls share a bottom edge. On narrow screens the blocks stack without fixed heights.' } },
  },
} satisfies Meta<GamePageProps>;
export default meta;
type Story = StoryObj<GamePageProps>;
export const StaticShell: Story = {};
export const NewGameOnly: Story = { args: {
  onAction: action('game-action'), availability: { actions: ['start', 'restart'] },
  statusMessage: 'Пока доступны начало и перезапуск партии. Движение, падение и пауза появятся позже.',
} };
export const Running: Story = { args: { data: runningScreen(), onAction: action('game-action') } };
export const Paused: Story = { args: { data: { ...runningScreen(), phase: 'paused' }, onAction: action('game-action') } };
export const GameOver: Story = { args: { data: gameOverScreen(), onAction: action('game-action') } };
export const LargeValues: Story = {
  args: { data: { ...runningScreen(), metrics: { score: 123456789012345, lines: 123456, level: 12345, highScore: 999999999999999 } } },
};
