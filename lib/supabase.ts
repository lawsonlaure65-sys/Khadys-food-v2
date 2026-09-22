import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MenuItem, Order } from '../types';
import { PlatDuJourConfig } from '../utils/marketing';
import { compressImage } from '../utils/imageCompressor';

export const DEFAULT_SUPABASE_URL = 'https://veygphkhehdnxefnnlwo.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleWdwaGtoZWhkbnhlZm5ubHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTE0MjgsImV4cCI6MjEwMTA4NzQyOH0.FsSg9wjrvVZ1zNHZH_D7qVxPd3EC1h1yM1mDMvxfAqw';

// Helper to clean and normalize Supabase URLs (removes trailing /rest/v1, slashes, etc.)
export const cleanSupabaseUrl = (rawUrl: string): string => {
  let url = (rawUrl || '').trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
};

// Helper to inspect all possible environment variable names
const getEnv = (key: string): string => {
  try {
    const meta = (import.meta as any).env;
    if (meta && meta[key]) return String(meta[key]).trim();
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return String(process.env[key]).trim();
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined' && (window as any)[key]) {
      return String((window as any)[key]).trim();
    }
  } catch (e) {}
  return '';
};

export const getSupabaseConfig = () => {
  let customUrl = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_url') || '' : '';
  let customKey = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_key') || '' : '';

  // If localStorage contains the old obsolete project, auto-clear it so it uses the active project
  if ((customUrl.includes('ldlwtoktwubucmbsfurw') || customKey.includes('ldlwtoktwubucmbsfurw')) && typeof window !== 'undefined') {
    localStorage.removeItem('khadys_custom_supabase_url');
    localStorage.removeItem('khadys_custom_supabase_key');
    customUrl = '';
    customKey = '';
  }

  let envUrl = 
    getEnv('VITE_SUPABASE_URL') ||
    getEnv('VITE_PUBLIC_SUPABASE_URL') ||
    getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
    getEnv('SUPABASE_URL') ||
    getEnv('REACT_APP_SUPABASE_URL') ||
    DEFAULT_SUPABASE_URL;

  let envKey = 
    getEnv('VITE_SUPABASE_ANON_KEY') ||
    getEnv('VITE_SUPABASE_KEY') ||
    getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    getEnv('VITE_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('SUPABASE_ANON_KEY') ||
    getEnv('SUPABASE_KEY') ||
    getEnv('REACT_APP_SUPABASE_ANON_KEY') ||
    DEFAULT_SUPABASE_KEY;

  // If environment variable was bundled with obsolete project, force replacement to active project
  if (envUrl.includes('ldlwtoktwubucmbsfurw')) {
    envUrl = DEFAULT_SUPABASE_URL;
  }
  if (envKey.includes('ldlwtoktwubucmbsfurw')) {
    envKey = DEFAULT_SUPABASE_KEY;
  }

  let rawUrl = (customUrl || envUrl).trim();
  if (rawUrl.includes('ldlwtoktwubucmbsfurw')) {
    rawUrl = DEFAULT_SUPABASE_URL;
  }
  const url = cleanSupabaseUrl(rawUrl);
  
  let key = (customKey || envKey).trim();
  if (key.includes('ldlwtoktwubucmbsfurw')) {
    key = DEFAULT_SUPABASE_KEY;
  }

  const isValid = 
    Boolean(url) && 
    url.startsWith('https://') && 
    !url.includes('votre_projet') && 
    !url.includes('example.supabase.co') &&
    Boolean(key) && 
    key.length > 20 && 
    !key.includes('votre_cle_anon');

  return { url, key, isValid, isCustom: Boolean(customUrl && customKey && !customUrl.includes('ldlwtoktwubucmbsfurw')) };
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isValid) return null;

  if (!cachedClient || lastUsedUrl !== config.url || lastUsedKey !== config.key) {
    try {
      cachedClient = createClient(config.url, config.key, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      lastUsedUrl = config.url;
      lastUsedKey = config.key;
    } catch (e) {
      console.warn('Erreur initialisation Supabase:', e);
      return null;
    }
  }
  return cachedClient;
};

// Legacy exports for backward compatibility
export const isSupabaseConfigured = getSupabaseConfig().isValid;

export const supabase: SupabaseClient | null = getSupabaseClient();

/**
 * Configure credentials manually (saves to localStorage and notifies the app)
 */
export const setCustomSupabaseCredentials = (url: string, key: string): { success: boolean; message: string } => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem('khadys_custom_supabase_url');
    localStorage.removeItem('khadys_custom_supabase_key');
    cachedClient = null;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khadys_supabase_config_changed', { detail: { configured: false } }));
    }
    return { success: true, message: 'Clés Supabase personnalisées réinitialisées.' };
  }

  if (!cleanUrl.startsWith('https://')) {
    return { success: false, message: "L'URL Supabase doit commencer par https:// (ex: https://xyzcompany.supabase.co)" };
  }

  if (cleanKey.length < 20) {
    return { success: false, message: "La clé anon Supabase est trop courte (doit être un token JWT valide d'au moins 20 caractères)." };
  }

  localStorage.setItem('khadys_custom_supabase_url', cleanUrl);
  localStorage.setItem('khadys_custom_supabase_key', cleanKey);
  
  // Re-instantiate client
  cachedClient = null;
  const client = getSupabaseClient();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('khadys_supabase_config_changed', { detail: { configured: true, url: cleanUrl } }));
  }

  return { 
    success: Boolean(client), 
    message: client ? '✅ Clés Supabase enregistrées et connectées avec succès !' : '⚠️ Erreur lors de la création du client Supabase.' 
  };
};

/**
 * Helper to identify network / DNS / fetch failures across all browsers (including Safari iOS 'Load failed')
 */
export const isSupabaseNetworkError = (errorOrMsg: any): boolean => {
  if (!errorOrMsg) return false;
  const msg = typeof errorOrMsg === 'string' 
    ? errorOrMsg 
    : (errorOrMsg.message || errorOrMsg.details || errorOrMsg.hint || String(errorOrMsg));
  const lower = msg.toLowerCase();
  return (
    lower.includes('load failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower.includes('network request failed') ||
    lower.includes('could not resolve') ||
    lower.includes('enotfound') ||
    lower.includes('fetch failed') ||
    lower.includes('err_name_not_resolved') ||
    lower.includes('connection refused') ||
    lower.includes('abort') ||
    lower.includes('timeout')
  );
};

export const formatSupabaseErrorMessage = (errorOrMsg: any, targetUrl?: string): string => {
  if (!errorOrMsg) return '';
  const rawMsg = typeof errorOrMsg === 'string' ? errorOrMsg : (errorOrMsg.message || String(errorOrMsg));
  
  if (isSupabaseNetworkError(rawMsg)) {
    return `Serveur Supabase injoignable (${targetUrl || 'URL active'}). Projet en PAUSE sur Supabase ou URL inexistante.`;
  }
  if (rawMsg.includes('42P01') || (rawMsg.toLowerCase().includes('relation') && rawMsg.toLowerCase().includes('does not exist'))) {
    return "Table inexistante dans la base Supabase. Veuillez exécuter le script SQL d'initialisation.";
  }
  if (rawMsg.includes('42501') || rawMsg.toLowerCase().includes('permission denied')) {
    return "Accès refusé par les règles RLS Supabase (exécutez le script SQL fourni).";
  }
  return rawMsg;
};

/**
 * Test connectivity with Supabase database with timeout & detailed diagnosis
 */
export const testSupabaseConnection = async (
  customUrl?: string, 
  customKey?: string
): Promise<{ success: boolean; message: string; isUnreachable?: boolean; details?: any }> => {
  let client = getSupabaseClient();
  let targetUrl = getSupabaseConfig().url;

  if (customUrl && customKey) {
    try {
      client = createClient(customUrl.trim(), customKey.trim());
      targetUrl = customUrl.trim();
    } catch (e: any) {
      return { success: false, message: `Format d'URL ou de clé invalide : ${e.message || e}` };
    }
  }

  if (!client) {
    return {
      success: false,
      message: "Supabase n'est pas configuré. Veuillez renseigner l'URL et la clé Anon."
    };
  }

  const cleanUrl = cleanSupabaseUrl(targetUrl);

  try {
    // 1. Direct Ping with timeout to quickly check if the host resolves & is reachable
    try {
      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 6000);
      const pingUrl = `${cleanUrl}/rest/v1/`;
      await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'apikey': (customKey || getSupabaseConfig().key).trim()
        },
        signal: abortCtrl.signal
      });
      clearTimeout(timeoutId);
    } catch (pingErr: any) {
      if (isSupabaseNetworkError(pingErr)) {
        return {
          success: false,
          isUnreachable: true,
          message: `⚠️ Impossible de joindre le serveur Supabase (${cleanUrl}).\n\n` +
            `Erreur détectée : "${pingErr.message || 'Load failed'}" (échec de connexion réseau / DNS).\n\n` +
            `Causes possibles & Solutions :\n` +
            `1. ⏸️ Projet Supabase en PAUSE : Supabase met automatiquement en veille les projets inactifs après 7 jours sur le plan gratuit. Connectez-vous sur https://supabase.com/dashboard et cliquez sur "Restore project" (réveil en 1 minute).\n` +
            `2. 🔄 Nouveau projet ou URL modifiée : Si vous avez un nouveau projet, collez sa nouvelle URL (https://xxxx.supabase.co) et sa clé anon dans "Configuration Manuelle des Clés" ci-dessous.\n` +
            `3. 🛡️ Vos données locales sont 100% en sécurité : Vos 35 plats, votre Plat du Jour et vos commandes continuent de fonctionner parfaitement dans l'application.`
        };
      }
    }

    // 2. Query table menu_items
    const { data: menuData, error: menuErr } = await client.from('menu_items').select('id').limit(1);
    
    if (menuErr) {
      if (isSupabaseNetworkError(menuErr)) {
        return {
          success: false,
          isUnreachable: true,
          message: `⚠️ Impossible de joindre le serveur Supabase (${cleanUrl}).\n\n` +
            `Erreur : "${menuErr.message}" (le serveur ne répond pas).\n\n` +
            `Causes & Solutions :\n` +
            `1. ⏸️ Projet en PAUSE sur Supabase : Rendez-vous sur https://supabase.com/dashboard pour cliquer sur "Restore project" / "Unpause".\n` +
            `2. 🔄 Clés modifiées : Vérifiez l'URL de votre projet dans les paramètres Supabase.\n` +
            `3. 🛡️ Vos données sont en sécurité : Plats, commandes et réglages restent enregistrés sur votre appareil.`
        };
      }
      if (menuErr.code === '42P01') {
        return {
          success: false,
          message: "La table 'menu_items' n'existe pas encore dans votre base Supabase. Veuillez exécuter le script SQL fourni dans l'onglet 'Script SQL'."
        };
      }
      if (menuErr.message?.includes('permission denied') || menuErr.code === '42501') {
        return {
          success: false,
          message: "Accès refusé par les règles RLS Supabase. Veuillez appliquer les politiques autorisant la lecture/écriture publique (voir script SQL)."
        };
      }
      return { success: false, message: `Erreur Supabase : ${menuErr.message}` };
    }

    return {
      success: true,
      message: `Connexion réussie au projet Supabase (${cleanUrl}) ! Les tables sont accessibles et prêtes.`
    };
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    if (isSupabaseNetworkError(errorMsg)) {
      return {
        success: false,
        isUnreachable: true,
        message: `⚠️ Impossible de joindre votre projet Supabase (${cleanUrl}).\n\nCauses possibles :\n1. Projet en PAUSE sur Supabase (plan gratuit) : Rendez-vous sur https://supabase.com/dashboard et cliquez sur "Restore project" / "Unpause".\n2. URL de projet modifiée ou supprimée.\n3. Vos données locales restent 100% disponibles.`
      };
    }
    return { success: false, message: `Échec de connexion : ${errorMsg}` };
  }
};

/**
 * SERVICE DE DONNÉES KHADY'S ELITE
 * Gère la synchronisation bidirectionnelle Cloud, Plat du Jour, Photo Admin, Menu & Commandes
 */
export const db = {
  // --- MENU ---
  fetchMenu: async (): Promise<MenuItem[] | null> => {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      // First try to read rich settings backup if present
      const fullMenuBackup = await db.fetchSetting<MenuItem[]>('full_menu_items');

      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });

      if (error || !data || data.length === 0) {
        return fullMenuBackup || null;
      }

      const backupMap = new Map<string, Partial<MenuItem>>();
      if (fullMenuBackup && Array.isArray(fullMenuBackup)) {
        fullMenuBackup.forEach(item => backupMap.set(item.id, item));
      }

      return data.map((row: any) => {
        const cached = backupMap.get(row.id) || {};
        return {
          id: row.id,
          name: row.name,
          description: row.description || '',
          price: Number(row.price),
          image: row.image,
          category: row.category,
          rating: row.rating ? Number(row.rating) : (cached.rating ?? 5),
          isAvailable: row.is_available ?? row.isAvailable ?? cached.isAvailable ?? true,
          isSpicy: row.is_spicy ?? row.isSpicy ?? cached.isSpicy ?? false,
          isSpécialitéMaison: row.is_specialite_maison ?? row.isSpécialitéMaison ?? cached.isSpécialitéMaison ?? false
        };
      }) as MenuItem[];
    } catch {
      return null;
    }
  },

  saveMenuItem: async (item: MenuItem): Promise<{ success: boolean; error?: string; data?: any }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré' };
    try {
      const fullPayload: any = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating || 5,
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy ?? false,
        is_specialite_maison: item.isSpécialitéMaison ?? false,
        is_plat_du_jour: Boolean((item as any).isPlatDuJour)
      };

      const { data, error } = await client
        .from('menu_items')
        .upsert(fullPayload, { onConflict: 'id' })
        .select();

      if (error) {
        if (isSupabaseNetworkError(error)) {
          return { success: false, error: formatSupabaseErrorMessage(error) };
        }
        // Fallback for base table schema (columns: id, name, description, price, category, image, is_plat_du_jour)
        const basePayload = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image,
          category: item.category,
          is_plat_du_jour: Boolean((item as any).isPlatDuJour)
        };

        const fallbackRes = await client
          .from('menu_items')
          .upsert(basePayload, { onConflict: 'id' })
          .select();

        if (fallbackRes.error) {
          if (isSupabaseNetworkError(fallbackRes.error)) {
            console.warn('⚠️ Mode Hors-Ligne: Sauvegarde cloud Supabase différée pour saveMenuItem:', fallbackRes.error.message || fallbackRes.error);
          } else {
            console.warn('⚠️ Avertissement Supabase saveMenuItem:', fallbackRes.error.message || fallbackRes.error);
          }
          return { success: false, error: formatSupabaseErrorMessage(fallbackRes.error.message) };
        }
      }

      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: formatSupabaseErrorMessage(e.message || 'Erreur inconnue') };
    }
  },

  syncAllMenuItems: async (items: MenuItem[]): Promise<{ success: boolean; error?: string; count: number }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré', count: 0 };
    try {
      // Also backup the complete list in app_settings so that all metadata is preserved across all schemas
      await db.saveSetting('full_menu_items', items).catch(() => {});

      const fullPayloads = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating || 5,
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy ?? false,
        is_specialite_maison: item.isSpécialitéMaison ?? false,
        is_plat_du_jour: Boolean((item as any).isPlatDuJour)
      }));

      const { error } = await client
        .from('menu_items')
        .upsert(fullPayloads, { onConflict: 'id' });

      if (error) {
        if (isSupabaseNetworkError(error)) {
          return { success: false, error: formatSupabaseErrorMessage(error), count: 0 };
        }
        // If the table lacks some columns like is_available or rating, retry with standard base columns
        const basePayloads = items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image,
          category: item.category,
          is_plat_du_jour: Boolean((item as any).isPlatDuJour)
        }));

        const fallbackRes = await client
          .from('menu_items')
          .upsert(basePayloads, { onConflict: 'id' });

        if (fallbackRes.error) {
          if (isSupabaseNetworkError(fallbackRes.error)) {
            console.warn('⚠️ Mode Hors-Ligne: Synchronisation cloud Supabase différée pour syncAllMenuItems:', fallbackRes.error.message || fallbackRes.error);
          } else {
            console.warn('⚠️ Avertissement Supabase syncAllMenuItems:', fallbackRes.error.message || fallbackRes.error);
          }
          return { success: false, error: formatSupabaseErrorMessage(fallbackRes.error.message), count: 0 };
        }
      }

      return { success: true, count: items.length };
    } catch (e: any) {
      return { success: false, error: formatSupabaseErrorMessage(e.message || 'Erreur inconnue'), count: 0 };
    }
  },

  deleteMenuItem: async (id: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré' };
    try {
      const { error } = await client.from('menu_items').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // --- PARAMÈTRES GLOBAUX & SYNCHRONISATION (APP_SETTINGS) ---
  fetchSetting: async <T = any>(key: string): Promise<T | null> => {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error || !data) return null;
      return data.value as T;
    } catch {
      return null;
    }
  },

  saveSetting: async (key: string, value: any): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré' };
    try {
      const { error } = await client
        .from('app_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      if (error) {
        if (isSupabaseNetworkError(error)) {
          console.warn(`⚠️ Mode Hors-Ligne: Synchronisation différée pour (${key}) :`, error.message || error);
        } else {
          console.warn(`⚠️ Avertissement saveSetting (${key}):`, error.message || error);
        }
        return { success: false, error: formatSupabaseErrorMessage(error) };
      }
      return { success: true };
    } catch (e: any) {
      if (isSupabaseNetworkError(e)) {
        console.warn(`⚠️ Mode Hors-Ligne: Synchronisation différée pour (${key}) :`, e.message || e);
      } else {
        console.warn(`⚠️ Exception saveSetting (${key}):`, e.message || e);
      }
      return { success: false, error: formatSupabaseErrorMessage(e.message || e) };
    }
  },

  // --- PLAT DU JOUR SYNC ---
  fetchPlatDuJour: async (): Promise<PlatDuJourConfig | null> => {
    return db.fetchSetting<PlatDuJourConfig>('plat_du_jour');
  },

  savePlatDuJour: async (plat: PlatDuJourConfig): Promise<{ success: boolean; error?: string }> => {
    return db.saveSetting('plat_du_jour', plat);
  },

  // --- PHOTO DE PROFIL ADMIN SYNC ---
  fetchAdminAvatar: async (): Promise<string | null> => {
    return db.fetchSetting<string>('admin_avatar');
  },

  saveAdminAvatar: async (avatarBase64OrUrl: string): Promise<{ success: boolean; error?: string }> => {
    let finalAvatar = avatarBase64OrUrl;
    if (typeof window !== 'undefined' && finalAvatar && finalAvatar.startsWith('data:image') && finalAvatar.length > 35000) {
      try {
        finalAvatar = await compressImage(finalAvatar, 250, 0.65);
      } catch {}
    }
    return db.saveSetting('admin_avatar', finalAvatar);
  },

  // --- SYNC MASTER GLOBAL (Tout pousser vers Supabase en 1 clic) ---
  syncEverythingToCloud: async (data: {
    menuItems?: MenuItem[];
    platDuJour?: PlatDuJourConfig;
    adminAvatar?: string;
    promoCodes?: any[];
    announcementBanner?: any;
    flashDeal?: any;
    customWhatsApp?: string;
  }): Promise<{ success: boolean; message: string; errors?: string[] }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: "Supabase n'est pas encore configuré." };
    }

    const errors: string[] = [];
    let syncedCount = 0;

    // 1. Sync Menu Items
    if (data.menuItems && data.menuItems.length > 0) {
      const res = await db.syncAllMenuItems(data.menuItems);
      if (res.success) syncedCount += res.count;
      else errors.push(`Menu : ${res.error}`);
    }

    // 2. Sync Plat du Jour
    if (data.platDuJour) {
      const res = await db.savePlatDuJour(data.platDuJour);
      if (!res.success) errors.push(`Plat du Jour : ${res.error}`);
    }

    // 3. Sync Admin Avatar
    if (data.adminAvatar) {
      const res = await db.saveAdminAvatar(data.adminAvatar);
      if (!res.success) errors.push(`Photo Profil Admin : ${res.error}`);
    }

    // 4. Sync Promo Codes, Banner, Flash Deal, WhatsApp
    if (data.promoCodes) await db.saveSetting('promo_codes', data.promoCodes);
    if (data.announcementBanner) await db.saveSetting('announcement_banner', data.announcementBanner);
    if (data.flashDeal) await db.saveSetting('flash_deal', data.flashDeal);
    if (data.customWhatsApp) await db.saveSetting('custom_whatsapp', data.customWhatsApp);

    if (errors.length > 0) {
      const isNetworkIssue = errors.some(e => isSupabaseNetworkError(e));
      const targetUrl = getSupabaseConfig().url;
      const advice = isNetworkIssue
        ? `\n\n💡 Cause de l'erreur : Le serveur Supabase (${targetUrl}) est actuellement inaccessible ("Load failed" / échec DNS).\n` +
          `• Si votre projet gratuit Supabase est en PAUSE (très courant après 7 jours sans visite) : rendez-vous sur https://supabase.com/dashboard et cliquez sur "Restore project" (réveil en 1 minute).\n` +
          `• Si vous avez créé un nouveau projet Supabase : collez sa nouvelle URL et sa clé anon dans l'onglet "Clés & Connexion".\n` +
          `• 🛡️ Rassurez-vous : vos 35 plats, votre Plat du Jour et vos réglages sont 100% conservés et opérationnels en local sur votre appareil !`
        : "";
      return {
        success: false,
        message: `Synchronisation partielle avec des avertissements : ${errors.map(e => formatSupabaseErrorMessage(e, targetUrl)).join(', ')}${advice}`,
        errors
      };
    }

    return {
      success: true,
      message: `✅ Synchronisation complète réussie ! Tous les plats (${syncedCount}), le Plat du Jour et le profil Admin sont enregistrés sur le Cloud Supabase.`
    };
  },

  // --- COMMANDES ---
  fetchOrders: async (): Promise<Order[] | null> => {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error || !data) return null;
      return data.map((row: any) => ({
        id: row.id,
        customerName: row.customer_name ?? row.customerName,
        phone: row.phone,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
        total: Number(row.total),
        deliveryFee: Number(row.delivery_fee ?? row.deliveryFee ?? 0),
        status: row.status,
        paymentMethod: row.payment_method ?? row.paymentMethod,
        timestamp: row.timestamp,
        district: row.district,
        address: row.address
      })) as Order[];
    } catch {
      return null;
    }
  },

  placeOrder: async (order: Order): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non connecté' };
    try {
      const { error } = await client
        .from('orders')
        .insert({
          id: order.id,
          customer_name: order.customerName,
          phone: order.phone,
          items: order.items,
          total: order.total,
          delivery_fee: order.deliveryFee || 0,
          status: order.status,
          payment_method: order.paymentMethod,
          timestamp: order.timestamp,
          district: order.district,
          address: order.address
        });
      if (error) {
        if (isSupabaseNetworkError(error)) {
          console.warn('⚠️ Mode Hors-Ligne: Envoi cloud Supabase différé (commande enregistrée en local) :', error.message || error);
        } else {
          console.warn('⚠️ Avertissement placeOrder Supabase:', error.message || error);
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { error } = await client
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) return null;
    } catch {
      return null;
    }
  }
};
