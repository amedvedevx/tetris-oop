import type { Meta, StoryObj } from '@storybook/html-vite';
import { GameStatus, type GameStatusProps } from './GameStatus';
import { gamePhases } from './GameScreenData';

const meta = {
  title: 'Blocks/GameStatus', tags: ['autodocs'], render: GameStatus,
  args: { phase: 'ready' },
  argTypes: { phase: { control: 'select', options: gamePhases } },
} satisfies Meta<GameStatusProps>;
export default meta;
type Story = StoryObj<GameStatusProps>;
export const Ready: Story = {};
export const Running: Story = { args: { phase: 'running' } };
export const Paused: Story = { args: { phase: 'paused' } };
export const GameOver: Story = { args: { phase: 'gameOver' } };
export const LongMessage: Story = { args: { message: 'Вы можете продолжить партию после возвращения к активной вкладке. Поле и показатели останутся на своих местах.' } };
