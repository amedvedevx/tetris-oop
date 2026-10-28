import type { Meta, StoryObj } from '@storybook/html-vite';
import { GamePageInteractionDemo } from './GamePageInteractionDemo';

const meta = {
  title: 'Examples/GamePageInteractionDemo', tags: ['autodocs'], render: GamePageInteractionDemo,
  parameters: { fullPage: true, docs: { description: { component: 'Переключает заранее заданные снимки для проверки событий, обновления данных и сохранения фокуса. Движения и игрового цикла здесь нет.' } } },
} satisfies Meta;
export default meta;
export const SnapshotUpdates: StoryObj = {};
