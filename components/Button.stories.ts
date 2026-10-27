import type { Meta, StoryObj } from '@storybook/html-vite';
import { Button, buttonOptions, type ButtonProps } from './Button';
import { ButtonInteractionDemo } from './ButtonInteractionDemo';

const meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: Button,
  args: { label: 'Начать игру', variant: 'primary', size: 'medium', disabled: false, fullWidth: false },
  argTypes: {
    variant: { control: 'select', options: buttonOptions.variants },
    size: { control: 'select', options: buttonOptions.sizes },
    onClick: { control: false },
  },
} satisfies Meta<ButtonProps>;

export default meta;
type Story = StoryObj<ButtonProps>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', label: 'Продолжить' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Начать заново' } };
export const Small: Story = { args: { size: 'small', label: 'Пауза' } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = { args: { fullWidth: true } };
export const LongLabel: Story = {
  args: { label: 'Продолжить текущую игру после возвращения к активной вкладке' },
};
export const Interactive: Story = { render: ButtonInteractionDemo };
