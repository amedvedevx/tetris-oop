import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    watch: { ignored: ['**/dist/**', '**/storybook-static/**'] },
  },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
