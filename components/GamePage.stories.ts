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
    docs: { description: { component: 'Score and time share a compact dark footer directly below the board. Controls sit directly below the preview with the standard page gap and matching side edges. Both columns stack their content from the top; narrow screens stack the columns. Time-only updates preserve the board, preview, status and focused controls.' } },
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
  args: { data: { ...runningScreen(), metrics: { score: 123456789012345, elapsedMs: 6_000_000 } } },
};
const movementArgs = {
  onAction: action('game-action'), availability: { actions: ['start', 'restart', 'moveLeft', 'moveRight'] as const },
  statusMessage: 'Доступны начало, перезапуск и движение влево/вправо. Повороты, падение и пауза появятся позже.',
};
export const MovementReady: Story = { args: movementArgs };
export const MovementRunning: Story = { args: { ...movementArgs, data: runningScreen() } };
export const MovementLongMessage: Story = { args: {
  ...movementArgs, data: runningScreen(),
  statusMessage: 'После начала партии двигайте фигуру кнопками или стрелками влево и вправо, когда фокус находится внутри игры. Фигура останавливается у границ поля и закреплённых клеток. Повороты, падение и пауза появятся позже.',
} };
