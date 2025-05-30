
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://lwwhcrctohmcztmummue.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d2hjcmN0b2htY3p0bXVtbXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTQ2ODAsImV4cCI6MjA2MzY3MDY4MH0.9SXwLuRmBU6u7xb90h71A3l4cZxddlp3GMOohH1UD9s";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Type exports for convenience
export type { User, Session } from '@supabase/supabase-js';
export type { Database } from '@/integrations/supabase/types';
