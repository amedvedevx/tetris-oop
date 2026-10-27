import type { Meta, StoryObj } from '@storybook/html-vite';
import { KeyHint, type KeyHintProps } from './KeyHint';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Components/KeyHint',
  tags: ['autodocs'],
  render: KeyHint,
  args: { key: 'Space' },
  argTypes: { key: { control: 'text' } },
} satisfies Meta<KeyHintProps>;

export default meta;
type Story = StoryObj<KeyHintProps>;

export const Space: Story = {};
export const Arrow: Story = { args: { key: '←' } };
export const Pause: Story = { args: { key: 'P' } };
export const Combination: Story = { args: { key: 'Ctrl + Enter' } };
export const LongKey: Story = { args: { key: 'ОченьДлинноеОбозначениеКлавишиДляПроверкиПереноса' } };
export const MovementKeys: Story = {
  render: () => Wrapper({ dir: 'row', gap: 'sm', children: ['←', '↓', '→'].map(key => KeyHint({ key })) }),
};
