import { createClient } from '@supabase/supabase-js';

// 확장프로그램 팝업(뷰어)에서는 .env가 없는 경우가 많아서, 렌더링이 깨지지 않도록 "유효한 URL"로 폴백합니다.
// (빈 문자열로 createClient를 호출하면 Invalid URL로 런타임 에러가 나서 화면이 하얗게 뜰 수 있음)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using localhost fallback for viewer.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
