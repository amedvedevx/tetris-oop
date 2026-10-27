import type { Meta, StoryObj } from '@storybook/html-vite';
import { Typography } from './Typography';
import { Wrapper, wrapperOptions, type WrapperProps } from './Wrapper';

const meta = {
  title: 'Foundations/Wrapper',
  tags: ['autodocs'],
  args: { display: 'flex', gap: 'md', padding: 'md' },
  render: args => renderWrapper(args, ['Первый блок', 'Второй блок', 'Третий блок']
    .map(text => Typography({ text }))),
  argTypes: {
    children: { control: false, table: { disable: true } },
    as: { control: 'select', options: wrapperOptions.tags },
    display: { control: 'select', options: wrapperOptions.displays },
    dir: { control: 'select', options: wrapperOptions.directions, if: { arg: 'display', eq: 'flex' } },
    columns: { control: 'select', options: wrapperOptions.columns, if: { arg: 'display', eq: 'grid' } },
    gap: { control: 'select', options: wrapperOptions.spaces },
    padding: { control: 'select', options: wrapperOptions.spaces },
    margin: { control: 'select', options: wrapperOptions.spaces },
    align: { control: 'select', options: wrapperOptions.alignments },
    justify: { control: 'select', options: wrapperOptions.justifications },
    maxWidth: { control: 'select', options: wrapperOptions.maxWidths },
    width: { control: 'select', options: wrapperOptions.widths },
  },
} satisfies Meta<WrapperProps>;

export default meta;
type Story = StoryObj<WrapperProps>;

export const Column: Story = {};
export const Row: Story = { args: { dir: 'row' } };
export const ResponsiveRow: Story = {
  args: { dir: { base: 'column', md: 'row' } },
  argTypes: { dir: { control: 'object' } },
};
export const ResponsiveGrid: Story = {
  args: { display: 'grid', columns: { base: 1, md: 2, lg: 3 }, gap: { base: 'sm', md: 'lg' } },
  argTypes: { columns: { control: 'object' }, gap: { control: 'object' } },
};
export const Empty: Story = { render: args => renderWrapper(args, []) };

// Controls retain inactive args when display changes; pass only the selected layout.
function renderWrapper(
  { display, dir, columns, ...layout }: WrapperProps,
  children: readonly HTMLElement[],
): HTMLElement {
  return display === 'grid'
    ? Wrapper({ ...layout, display, columns: columns ?? 1, children })
    : Wrapper({ ...layout, dir: dir ?? 'column', children });
}
