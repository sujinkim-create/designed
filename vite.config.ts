import path from 'path';
import { defineConfig, loadEnv } from 'vite';
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
    build: mode === 'extension'
      ? {
        // Chrome "Load unpacked"로 바로 올릴 수 있게 dist 안에 manifest 포함
        outDir: 'dist-extension',
        emptyOutDir: true,
      }
      : undefined,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
