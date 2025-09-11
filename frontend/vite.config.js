import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), react(), svgr({
      svgrOptions: {
        icon: true,
      },
    })],
  server: mode === 'development' ? {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  } : undefined
}));