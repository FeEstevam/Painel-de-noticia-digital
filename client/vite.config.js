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
    host: true, // Permite acesso pela rede local / Wi-Fi (Smart TV, celulares, totens)
    port: 3000
  }
});
