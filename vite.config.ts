import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Serve the banners/ directory as static assets from the project root
  publicDir: 'public',
  server: {
    port: 5173,
    // Allow serving files from the project root (for banners/)
    fs: {
      allow: ['..'],
    },
  },
});
