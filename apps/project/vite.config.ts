import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-local',
    emptyOutDir: true
  },
  server: {
    port: 3014,
    host: '0.0.0.0'
  },
  preview: {
    port: 3014,
    host: '0.0.0.0'
  }
});
