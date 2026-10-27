import type { Meta, StoryObj } from '@storybook/html-vite';
import { Typography, type TypographyProps } from './Typography';
import { Surface } from './Surface';

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  render: Typography,
  args: { text: 'Каждая фигура — новый ход.', as: 'p', variant: 'body', tone: 'default' },
  argTypes: {
    as: { control: 'select', options: ['h1', 'h2', 'h3', 'p', 'span'] },
    variant: { control: 'select', options: ['title', 'heading', 'body', 'caption', 'label', 'metric'] },
    tone: { control: 'select', options: ['default', 'muted', 'inverse', 'accent', 'danger'] },
    text: { control: 'text' },
    live: { control: 'select', options: ['off', 'polite', 'assertive'] },
  },
} satisfies Meta<TypographyProps>;

export default meta;
type Story = StoryObj<TypographyProps>;

export const Body: Story = {};
export const Title: Story = { args: { as: 'h1', variant: 'title', text: 'Tetris OOP' } };
export const Heading: Story = { args: { as: 'h2', variant: 'heading', text: 'Следующая фигура' } };
export const Caption: Story = { args: { variant: 'caption', tone: 'muted', text: 'Пауза — P или Escape' } };
export const Label: Story = { args: { as: 'span', variant: 'label', text: 'Продолжить игру' } };
export const Metric: Story = { args: { variant: 'metric', text: 1234567890 } };
export const ErrorMessage: Story = { args: { tone: 'danger', text: 'Не удалось прочитать рекорд.' } };
export const LongText: Story = {
  args: { text: 'ОченьДлиннаяНепрерывнаяПодписьДляПроверкиПереносаБезОбрезанияТекстаНаУзкомЭкране' },
};
export const LiteralMarkup: Story = { args: { text: '<strong>Это обычный текст</strong>' } };
export const Empty: Story = { args: { text: '' } };
export const Inverse: Story = {
  args: { tone: 'inverse', text: 'Читаемый текст на тёмной поверхности' },
  render: args => Surface({ variant: 'inverted', children: [Typography(args)] }),
};
