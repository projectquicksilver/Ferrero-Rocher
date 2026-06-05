import { createClient } from '@supabase/supabase-js';

// --- Hardcoded fallback credentials (used if .env is not loaded by Vite) ---
const FALLBACK_URL = 'https://ocuyqezffpapmrwzficc.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdXlxZXpmZnBhcG1yd3pmaWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDUxMTIsImV4cCI6MjA5NTYyMTExMn0.eT3K3jYKaqzMs7TGYVSoa0W8tUJVn4Rne7VmIkEgP28';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim() || FALLBACK_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim() || FALLBACK_KEY;

// Always log what the browser is actually using so we can debug
console.log('🔌 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key loaded:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

// isSupabaseConfigured is true as long as valid URL and key are present
export const isSupabaseConfigured = 
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('dummy_anon_key') &&
  supabaseUrl.startsWith('http');

console.log('✅ Supabase configured:', isSupabaseConfigured);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase is NOT fully configured.\n' +
    'Falling back to simulated Local Storage mode.'
  );
}

let client = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (e) {
    console.error('❌ Failed to initialize Supabase client:', e.message);
  }
}

export const supabase = client;
