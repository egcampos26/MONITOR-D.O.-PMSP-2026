import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmhgtwgjgjyybapwyfib.supabase.co';
const supabaseAnonKey = 'sb_publishable_wq3OhEB1NUkuESrA30CZjQ_HkEs7ne0';

if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key não encontrada. Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
