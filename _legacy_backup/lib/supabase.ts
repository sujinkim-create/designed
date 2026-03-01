import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables on the special import.meta.env object.
// They MUST start with VITE_ to be exposed to the client.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only warn in development to avoid console noise in production if handled gracefully elsewhere
  if (import.meta.env.DEV) {
    console.warn(
      'Supabase keys are missing! Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
    );
  }
}

// Export a single instance to be reused
// We use 'as string' because if they are missing, the app will likely fail anyway, 
// or the warning above will help debug.
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
