import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 1. Base path: vital for assets to load correctly.
    // Use './' for relative paths (often needed for extensions), otherwise '/' or undefined.
    base: mode === 'extension' ? './' : undefined,

    server: {
      port: 3000,
      host: '0.0.0.0', // Expose to network/Vercel
      strictPort: false,
      proxy: {
        // Proxy API requests to Vercel/External API during local dev
        // This helps avoid CORS issues if calling external APIs directly
        '/api/v1': {
          target: 'https://api.openai.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const key = env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY;
              if (key) {
                proxyReq.setHeader('Authorization', `Bearer ${key}`);
              }
            });
          }
        },
      },
    },

    build: {
      outDir: mode === 'extension' ? 'dist-extension' : 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development', // Useful for debugging
    },

    // 2. Plugins: Ensure React is first
    plugins: [
      react(),
      tailwindcss()
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
