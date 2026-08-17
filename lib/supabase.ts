import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MenuItem, Order } from '../types';
import { PlatDuJourConfig } from '../utils/marketing';

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
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_url') || '' : '';
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_key') || '' : '';

  const envUrl = 
    getEnv('VITE_SUPABASE_URL') ||
    getEnv('VITE_PUBLIC_SUPABASE_URL') ||
    getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
    getEnv('SUPABASE_URL') ||
    getEnv('REACT_APP_SUPABASE_URL') ||
    '';

  const envKey = 
    getEnv('VITE_SUPABASE_ANON_KEY') ||
    getEnv('VITE_SUPABASE_KEY') ||
    getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    getEnv('VITE_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    getEnv('SUPABASE_ANON_KEY') ||
    getEnv('SUPABASE_KEY') ||
    getEnv('REACT_APP_SUPABASE_ANON_KEY') ||
    '';

  const url = (customUrl || envUrl).trim();
  const key = (customKey || envKey).trim();

  const isValid = 
    Boolean(url) && 
    url.startsWith('https://') && 
    !url.includes('votre_projet') && 
    !url.includes('example.supabase.co') &&
    Boolean(key) && 
    key.length > 20 && 
    !key.includes('votre_cle_anon');

  return { url, key, isValid, isCustom: Boolean(customUrl && customKey) };
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
 * Test connectivity with Supabase database
 */
export const testSupabaseConnection = async (
  customUrl?: string, 
  customKey?: string
): Promise<{ success: boolean; message: string; details?: any }> => {
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

  try {
    // 1. Check menu_items table
    const { data: menuData, error: menuErr } = await client.from('menu_items').select('id').limit(1);
    
    if (menuErr) {
      // Check for common RLS error or missing table
      if (menuErr.code === '42P01') {
        return {
          success: false,
          message: "La table 'menu_items' n'existe pas encore dans votre base Supabase. Veuillez exécuter le script SQL fourni."
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
      message: `Connexion réussie au projet Supabase (${targetUrl}) ! Les tables sont accessibles et prêtes.`
    };
  } catch (err: any) {
    return { success: false, message: `Échec de connexion : ${err.message || err}` };
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
      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      if (error || !data) return null;
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        price: Number(row.price),
        image: row.image,
        category: row.category,
        rating: row.rating ? Number(row.rating) : 5,
        isAvailable: row.is_available ?? row.isAvailable ?? true,
        isSpicy: row.is_spicy ?? row.isSpicy ?? false,
        isSpécialitéMaison: row.is_specialite_maison ?? row.isSpécialitéMaison ?? false
      })) as MenuItem[];
    } catch {
      return null;
    }
  },

  saveMenuItem: async (item: MenuItem): Promise<{ success: boolean; error?: string; data?: any }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré' };
    try {
      const payload = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating || 5,
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy ?? false,
        is_specialite_maison: item.isSpécialitéMaison ?? false
      };

      const { data, error } = await client
        .from('menu_items')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('❌ Erreur Supabase saveMenuItem:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur inconnue' };
    }
  },

  syncAllMenuItems: async (items: MenuItem[]): Promise<{ success: boolean; error?: string; count: number }> => {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase non configuré', count: 0 };
    try {
      const payloads = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating || 5,
        is_available: item.isAvailable ?? true,
        is_spicy: item.isSpicy ?? false,
        is_specialite_maison: item.isSpécialitéMaison ?? false
      }));

      const { error } = await client
        .from('menu_items')
        .upsert(payloads, { onConflict: 'id' });

      if (error) {
        console.error('❌ Erreur Supabase syncAllMenuItems:', error);
        return { success: false, error: error.message, count: 0 };
      }
      return { success: true, count: items.length };
    } catch (e: any) {
      return { success: false, error: e.message, count: 0 };
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
        console.error(`❌ Erreur saveSetting (${key}):`, error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
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
    return db.saveSetting('admin_avatar', avatarBase64OrUrl);
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
      return {
        success: false,
        message: `Synchronisation partielle avec des avertissements : ${errors.join(', ')}`,
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
        console.error('❌ Erreur placeOrder Supabase:', error);
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
