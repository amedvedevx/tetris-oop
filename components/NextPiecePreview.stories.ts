import type { Meta, StoryObj } from '@storybook/html-vite';
import { NextPiecePreview, type NextPiecePreviewProps } from './NextPiecePreview';
import { previewPieces } from './gameShell.fixtures';

const meta = {
  title: 'Blocks/NextPiecePreview', tags: ['autodocs'], render: NextPiecePreview,
  args: { piece: null }, argTypes: { piece: { control: 'object' } },
  parameters: { docs: { description: { component: 'The supplied figure is centered on both axes inside the 4×4 mini-board, including half-cell offsets. Its relative geometry is preserved. The heading and explanatory text remain left-aligned.' } } },
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
export const SuppliedStencil: Story = { args: { piece: {
  kind: 'I', cells: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
} } };
