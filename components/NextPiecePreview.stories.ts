import type { Meta, StoryObj } from '@storybook/html-vite';
import { NextPiecePreview, type NextPiecePreviewProps } from './NextPiecePreview';
import { previewPieces } from './gameShell.fixtures';

const meta = {
  title: 'Blocks/NextPiecePreview', tags: ['autodocs'], render: NextPiecePreview,
  args: { piece: null }, argTypes: { piece: { control: 'object' } },
} satisfies Meta<NextPiecePreviewProps>;
export default meta;
type Story = StoryObj<NextPiecePreviewProps>;
export const Empty: Story = {};
export const I: Story = { args: { piece: previewPieces[0]! } };
export const O: Story = { args: { piece: previewPieces[1]! } };
export const T: Story = { args: { piece: previewPieces[2]! } };
export const S: Story = { args: { piece: previewPieces[3]! } };
export const Z: Story = { args: { piece: previewPieces[4]! } };
export const J: Story = { args: { piece: previewPieces[5]! } };
export const L: Story = { args: { piece: previewPieces[6]! } };
