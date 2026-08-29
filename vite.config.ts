import { networkInterfaces } from 'node:os';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function bookingApiOrigin(env: Record<string, string>): string {
  if (env.BOOKING_API_ORIGIN) {
    return env.BOOKING_API_ORIGIN;
  }
  const publicIpv4 = Object.values(networkInterfaces())
    .flat()
    .filter((iface): iface is NonNullable<typeof iface> =>
      Boolean(iface && !iface.internal && iface.family === 'IPv4'),
    )
    .map((iface) => iface.address);
  if (publicIpv4[0]) {
    return `http://${publicIpv4[0]}:5000`;
  }
  return 'http://127.0.0.1:5000';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3100,
      proxy: {
        '/v1': { target: bookingApiOrigin(env), changeOrigin: true, xfwd: true },
        '/health': { target: bookingApiOrigin(env), changeOrigin: true, xfwd: true },
      },
    },
  };
});
