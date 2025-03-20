import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@supabase/supabase-js'],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript',
      'X-Content-Type-Options': 'nosniff'
    }
  }
});
