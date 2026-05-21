import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: {
    port: 4177,
    strictPort: true,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    proxy: {
      '/api': 'http://localhost:4178',
      '/uploads': 'http://localhost:4178'
    }
  },
  preview: {
    port: 4177,
    strictPort: true,
    host: '0.0.0.0'
  }
}));
