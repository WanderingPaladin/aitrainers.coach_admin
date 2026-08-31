import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = env.BOOKING_API_ORIGIN || 'http://127.0.0.1:4000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/v1': { target: apiOrigin, changeOrigin: true, xfwd: true },
        '/health': { target: apiOrigin, changeOrigin: true, xfwd: true },
      },
    },
  };
});
