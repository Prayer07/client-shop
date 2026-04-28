import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-router-dom', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['react-icons'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit since we're optimizing chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  server: {
    preTransformRequests: ['react', 'react-router-dom'],
  },
})