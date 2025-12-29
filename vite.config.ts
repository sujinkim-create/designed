import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  return {
    // GitHub Pages repository name as base path
    base: '/english-sj/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      outDir: mode === 'extension' ? 'dist-extension' : 'dist',
      emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
