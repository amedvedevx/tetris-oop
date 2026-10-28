import type { Meta, StoryObj } from '@storybook/html-vite';
import { action } from 'storybook/actions';
import { GamePage, type GamePageProps } from './GamePage';
import { gameOverScreen, readyScreen, runningScreen } from './gameShell.fixtures';

const meta = {
  title: 'Pages/GamePage', tags: ['autodocs'], render: GamePage,
  args: { data: readyScreen() },
  argTypes: { data: { control: 'object' }, onAction: { control: false } },
  parameters: { layout: 'fullscreen', fullPage: true },
} satisfies Meta<GamePageProps>;
export default meta;
type Story = StoryObj<GamePageProps>;
export const StaticShell: Story = {};
export const Running: Story = { args: { data: runningScreen(), onAction: action('game-action') } };
export const Paused: Story = { args: { data: { ...runningScreen(), phase: 'paused' }, onAction: action('game-action') } };
export const GameOver: Story = { args: { data: gameOverScreen(), onAction: action('game-action') } };
export const LargeValues: Story = {
  args: { data: { ...runningScreen(), metrics: { score: 123456789012345, lines: 123456, level: 12345, highScore: 999999999999999 } } },
};
