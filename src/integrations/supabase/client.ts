import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase is not configured for this environment. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to run auth/admin/product APIs locally."
  );
}

const fallbackUrl = "https://example.supabase.co";
const fallbackAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmYWxsYmFjayIsInJlZiI6ImZhbGxiYWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6NDEwMjQ0NDgwMH0.WGQ9bzbxSKWlWfgYv2M7QfYJYHk1tXJ_nVGzW-IgZ-Q";

export const supabase = createClient<Database>(SUPABASE_URL ?? fallbackUrl, SUPABASE_PUBLISHABLE_KEY ?? fallbackAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
