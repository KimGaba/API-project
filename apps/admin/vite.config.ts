import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminPort = Number(env.VITE_ADMIN_PORT || env.ADMIN_PORT || 3013);

  return {
    base: './',
    plugins: [react()],
    build: {
      outDir: 'dist-local',
      emptyOutDir: true
    },
    server: {
      port: adminPort,
      host: '0.0.0.0'
    },
    preview: {
      port: adminPort,
      host: '0.0.0.0'
    }
  };
});
