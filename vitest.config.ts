
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const SUPABASE_PKGS = [
  '@supabase/supabase-js',
  '@supabase/postgrest-js',
  '@supabase/gotrue-js',
  '@supabase/realtime-js',
  '@supabase/storage-js',
  '@supabase/functions-js'
];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    deps: {
      inline: SUPABASE_PKGS
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
