import type { Meta, StoryObj } from '@storybook/html-vite';
import { Typography } from './Typography';
import { Wrapper, type WrapperProps } from './Wrapper';

const meta = {
  title: 'Foundations/Wrapper',
  tags: ['autodocs'],
  args: { display: 'flex', dir: 'column', gap: 'md', padding: 'md' },
  render: (args) => Wrapper({
    ...args,
    children: ['Первый блок', 'Второй блок', 'Третий блок'].map(text => Typography({text})),
  }),
  argTypes: {
    children: { control: false, table: { disable: true } },
    display: { control: 'select', options: ['flex', 'grid'] },
    dir: { control: 'select', options: ['row', 'column'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    padding: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    margin: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    maxWidth: { control: 'select', options: ['none', 'reading', 'content'] },
    width: { control: 'select', options: ['auto', 'full'] },
  },
} satisfies Meta<WrapperProps>;

export default meta;
type Story = StoryObj<WrapperProps>;

export const Column: Story = {};
export const Row: Story = { args: { dir: 'row' } };
export const ResponsiveRow: Story = { args: { dir: { base: 'column', md: 'row' } } };
export const ResponsiveGrid: Story = {
  args: { display: 'grid', columns: { base: 1, md: 2, lg: 3 }, gap: { base: 'sm', md: 'lg' } },
};
export const Empty: Story = { render: args => Wrapper({ ...args, children: [] }) };
