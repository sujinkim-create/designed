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
