import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nfxkddqwdnujkqyuxwng.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key não encontrada. Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
