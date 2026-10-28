import type { Preview } from '@storybook/html-vite';
import { Wrapper } from '../components/Wrapper';
import '../components/theme.css';

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  decorators: [(story, context) => context.parameters.fullPage
    ? story()
    : Wrapper({ padding: 'md', children: [story() as HTMLElement] })],
};

export default preview;
