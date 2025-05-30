
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
        manualChunks: {
          // Core vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // UI framework chunks
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'ui-forms': ['@radix-ui/react-checkbox', '@radix-ui/react-radio-group', '@radix-ui/react-switch'],
          'ui-navigation': ['@radix-ui/react-navigation-menu', '@radix-ui/react-tabs', '@radix-ui/react-accordion'],
          
          // Heavy libraries
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          animations: ['framer-motion'],
          
          // Data processing
          'data-utils': ['date-fns', 'uuid'],
          'file-utils': ['jspdf', 'jspdf-autotable', 'xlsx', 'papaparse'],
          
          // Utility chunks
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          icons: ['lucide-react'],
          
          // Supabase
          supabase: ['@supabase/supabase-js']
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
    exclude: [
      '@supabase/supabase-js',
      '@supabase/postgrest-js',
      '@supabase/realtime-js',
      '@supabase/storage-js',
      '@supabase/functions-js'
    ]
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));
