import { createClient } from '@supabase/supabase-js';

// Next.js exposes environment variables on process.env.
// They MUST start with NEXT_PUBLIC_ to be exposed to the client.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only warn in development to avoid console noise in production if handled gracefully elsewhere
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Supabase keys are missing! Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
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
