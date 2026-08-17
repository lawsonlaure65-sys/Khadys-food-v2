import { getSupabaseClient, isSupabaseConfigured, getSupabaseConfig, db } from './lib/supabase';

export const supabase = getSupabaseClient();
export { isSupabaseConfigured, getSupabaseConfig, db };

if (!isSupabaseConfigured) {
  console.log("ℹ️ Supabase n'est pas encore configuré avec les clés d'environnement ou locales.");
}
