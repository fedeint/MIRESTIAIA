import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://twneirdsvyxsdsneidhi.supabase.co';
const supabaseKey = 'sb_publishable_A0yo_kDAGY3OamrUOOL9Bw_ShVWdBMF';
const SUPABASE_SINGLETON_KEY = '__mirest_supabase_client__';

const globalScope = globalThis;

if (!globalScope[SUPABASE_SINGLETON_KEY]) {
  globalScope[SUPABASE_SINGLETON_KEY] = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = globalScope[SUPABASE_SINGLETON_KEY];
export { supabaseUrl, supabaseKey };

// Obtenemos los metadatos del usuario logueado actualmente
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

// Cerramos sesión Global
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = './login.html';
  }
}
