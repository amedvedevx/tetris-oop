import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import applicationConfig from '../../../vite.config';

export default mergeConfig(applicationConfig, {
  build: {
    outDir: '.cache/e2e-app',
    rollupOptions: { input: fileURLToPath(new URL('./index.html', import.meta.url)) },
  },
});
