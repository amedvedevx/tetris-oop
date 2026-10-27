import type { Meta, StoryObj } from '@storybook/html-vite';
import { buttonOptions } from './Button';
import { ButtonInteractionDemo, type ButtonInteractionDemoProps } from './ButtonInteractionDemo';

const meta = {
  title: 'Examples/ButtonInteractionDemo',
  tags: ['autodocs'],
  render: ButtonInteractionDemo,
  args: { label: 'Начать игру', variant: 'primary', size: 'medium', disabled: false, fullWidth: false },
  argTypes: {
    variant: { control: 'select', options: buttonOptions.variants },
    size: { control: 'select', options: buttonOptions.sizes },
  },
} satisfies Meta<ButtonInteractionDemoProps>;

export default meta;
type Story = StoryObj<ButtonInteractionDemoProps>;

export const Interactive: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongLabel: Story = {
  args: { label: 'Продолжить текущую игру после возвращения к активной вкладке' },
};
