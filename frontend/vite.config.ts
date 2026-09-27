import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  optimizeDeps: {
    include: ['canvg', 'html2canvas', 'dompurify'],
  },
  server: {
    port: 5173,
    proxy: {
      // In local dev, forward /api/* → Node backend on port 8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket proxy for live detection
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    // Vercel serves the frontend and FastAPI function from the same deployment.
    outDir: '../public',
    // The root public directory already contains the sample audio assets.
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
        },
      },
    },
  },
});
