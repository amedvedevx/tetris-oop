import type { Meta, StoryObj } from '@storybook/html-vite';
import { action } from 'storybook/actions';
import { GameControls, type GameControlsProps } from './GameControls';
import { gamePhases } from './GameScreenData';

const meta = {
  title: 'Blocks/GameControls', tags: ['autodocs'], render: GameControls,
  args: { phase: 'ready', onAction: action('game-action') },
  argTypes: { phase: { control: 'select', options: gamePhases }, onAction: { control: false }, availability: { control: 'object' } },
} satisfies Meta<GameControlsProps>;
export default meta;
type Story = StoryObj<GameControlsProps>;
export const Ready: Story = {};
export const Running: Story = { args: { phase: 'running' } };
export const Paused: Story = { args: { phase: 'paused' } };
export const GameOver: Story = { args: { phase: 'gameOver' } };
export const Unavailable: Story = { render: ({ phase }) => GameControls({ phase }) };
export const NewGameOnly: Story = { args: { phase: 'running', availability: { actions: ['start', 'restart'], shortcuts: [] } } };
