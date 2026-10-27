import type { Meta, StoryObj } from '@storybook/html-vite';
import { Surface, type SurfaceProps } from './Surface';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

const meta = {
  title: 'Components/Surface',
  tags: ['autodocs'],
  args: { as: 'section', variant: 'plain', size: 'comfortable', fullWidth: true, ariaLabel: 'Панель' },
  render: args => Surface({
    ...args,
    children: [Wrapper({
      gap: 'sm',
      children: [
        Typography({ as: 'h2', variant: 'heading', text: 'Спокойное место для следующего хода', tone: args.variant === 'inverted' ? 'inverse' : 'default' }),
        Typography({ text: 'Панель владеет своим фоном, рамкой и внутренними отступами.', tone: args.variant === 'inverted' ? 'inverse' : 'muted' }),
      ],
    })],
  }),
  argTypes: {
    children: { control: false, table: { disable: true } },
    as: { control: 'select', options: ['div', 'section'] },
    variant: { control: 'select', options: ['plain', 'muted', 'inverted'] },
    size: { control: 'select', options: ['compact', 'comfortable'] },
  },
} satisfies Meta<SurfaceProps>;

export default meta;
type Story = StoryObj<SurfaceProps>;

export const Plain: Story = {};
export const Muted: Story = { args: { variant: 'muted' } };
export const Inverted: Story = { args: { variant: 'inverted' } };
export const Compact: Story = { args: { size: 'compact' } };
export const Empty: Story = { render: args => Surface({ ...args, children: [] }) };
export const LongContent: Story = {
  render: args => Surface({
    ...args,
    children: [Typography({ text: 'ДлиннаяПодписьКотораяДолжнаОставатьсяВГраницахПанелиИПереноситьсяНаУзкомЭкране', tone: args.variant === 'inverted' ? 'inverse' : 'default' })],
  }),
};
