
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

const SUPABASE_PKGS = [
  '@supabase/supabase-js',
  '@supabase/postgrest-js',
  '@supabase/gotrue-js',
  '@supabase/realtime-js',
  '@supabase/storage-js',
  '@supabase/functions-js'
];

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Handle Supabase separately to avoid CJS/ESM conflicts
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Core vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('@radix-ui')) return 'ui-core';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor';
            return 'vendor-misc';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: mode === 'development',
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@tanstack/react-query',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: SUPABASE_PKGS,
    esbuildOptions: {
      target: 'esnext',
    }
  },
  ssr: {
    noExternal: SUPABASE_PKGS
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));
