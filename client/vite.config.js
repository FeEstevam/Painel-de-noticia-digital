import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/client': path.resolve(__dirname, './'),
      '@': path.resolve(__dirname, './')
    }
  },
  server: {
    port: 3000
  }
});
