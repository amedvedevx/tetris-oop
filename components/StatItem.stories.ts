import type { Meta, StoryObj } from '@storybook/html-vite';
import { StatItem, type StatItemProps } from './StatItem';

const meta = {
  title: 'Blocks/StatItem', tags: ['autodocs'], render: StatItem,
  args: { label: 'Очки', value: 0 },
} satisfies Meta<StatItemProps>;
export default meta;
type Story = StoryObj<StatItemProps>;
export const Zero: Story = {};
export const Level: Story = { args: { label: 'Уровень', value: 1 } };
export const LargeValue: Story = { args: { value: 123456789012345 } };
export const LongLabel: Story = { args: { label: 'Количество линий за текущую партию' } };
