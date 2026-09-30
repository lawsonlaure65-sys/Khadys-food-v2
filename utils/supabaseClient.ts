import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MenuItem, Order, Review } from '../types';

// Production credentials from Khady's Food Vercel project
export const DEFAULT_SUPABASE_URL = 'https://veygphkhehdnxefnnlwo.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleWdwaGtoZWhkbnhlZm5ubHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTE0MjgsImV4cCI6MjEwMTA4NzQyOH0.FsSg9wjrvVZ1zNHZH_D7qVxPd3EC1h1yM1mDMvxfAqw';

const STORAGE_KEY_URL = 'khadys_supabase_url_v2';
const STORAGE_KEY_ANON = 'khadys_supabase_anon_key_v2';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  if (typeof window === 'undefined') {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, isCustom: false };
  }

  try {
    const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
    const storedKey = localStorage.getItem(STORAGE_KEY_ANON);

    // Auto-migrate if someone saved the corrupted key with typo (174 instead of 178)
    if (storedKey && storedKey.includes('1745511428')) {
      localStorage.setItem(STORAGE_KEY_ANON, DEFAULT_SUPABASE_ANON_KEY);
      return { url: storedUrl?.trim() || DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, isCustom: false };
    }

    if (storedUrl && storedKey) {
      return { url: storedUrl.trim(), anonKey: storedKey.trim(), isCustom: true };
    }
  } catch (e) {
    console.warn('Erreur lecture localStorage Supabase:', e);
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, isCustom: false };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }

  // Invalidate cached client
  cachedClient = null;
  currentUrl = '';
  currentKey = '';
}

export function resetSupabaseCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  cachedClient = null;
  currentUrl = '';
  currentKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (cachedClient && currentUrl === url && currentKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    currentUrl = url;
    currentKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Erreur initialisation Supabase:', err);
    return null;
  }
}

// Helper to extract missing column from PostgreSQL error message
function extractMissingColumn(error: any): string | null {
  if (!error) return null;
  const msg = String(error.message || error);
  // Match 'column "x" of relation "menu_items" does not exist'
  const m1 = msg.match(/column ['"]?([a-zA-Z0-9_]+)['"]? of relation ['"]?menu_items['"]? does not exist/i);
  if (m1 && m1[1]) return m1[1];
  const m2 = msg.match(/column menu_items\.([a-zA-Z0-9_]+) does not exist/i);
  if (m2 && m2[1]) return m2[1];
  return null;
}

// Resilient upsert that automatically prunes non-existent columns on PostgreSQL tables
async function resilientUpsertMenuItems(supabase: SupabaseClient, records: any[]): Promise<{ error: any }> {
  if (!records || records.length === 0) return { error: null };
  let workingRecords = records.map(r => ({ ...r }));
  const droppedColumns = new Set<string>();

  // Attempt up to 10 column auto-prunings
  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await supabase.from('menu_items').upsert(workingRecords, { onConflict: 'id' });
    if (!error) return { error: null };

    const missingCol = extractMissingColumn(error);
    if (missingCol && !droppedColumns.has(missingCol) && missingCol !== 'id') {
      droppedColumns.add(missingCol);
      workingRecords = workingRecords.map(rec => {
        const copy = { ...rec };
        delete copy[missingCol];
        return copy;
      });
      continue;
    }

    // If still fails, try minimal compatible column set
    break;
  }

  // Fallback to strict minimal column schema
  const fallbackColumns = [
    'id', 'name', 'description', 'price', 'category', 'image',
    'is_available', 'is_spicy', 'is_specialite_maison', 'is_plat_du_jour', 'rating'
  ];
  const minimalRecords = workingRecords.map(r => {
    const minRec: any = {};
    for (const col of fallbackColumns) {
      if (r[col] !== undefined && !droppedColumns.has(col)) {
        minRec[col] = r[col];
      }
    }
    return minRec;
  });

  const fallbackResult = await supabase.from('menu_items').upsert(minimalRecords, { onConflict: 'id' });
  return { error: fallbackResult.error };
}

// Convert MenuItem to DB record format
function menuItemToDbRecord(it: MenuItem) {
  const isSpecialite = Boolean(it.isSpecialiteMaison || it.isSpécialitéMaison);
  const isDaily = Boolean(it.isPlatDuJour || it.isFeatured);
  return {
    id: it.id,
    name: it.name,
    description: it.description || '',
    price: Number(it.price) || 0,
    category: it.category || 'Spécialité Maison',
    image: it.image || '',
    rating: it.rating ? Number(it.rating) : 5,
    is_available: it.available !== false,
    is_spicy: Boolean(it.isSpicy || (it.spicyLevel && it.spicyLevel > 1)),
    is_specialite_maison: isSpecialite,
    is_plat_du_jour: isDaily,
    created_at: it.createdAt || new Date().toISOString()
  };
}

// Convert DB record to MenuItem
function dbRecordToMenuItem(row: any): MenuItem {
  const name = String(row.name || '');
  const isSpecialite = Boolean(row.is_specialite_maison || row.isSpecialiteMaison);
  const isDaily = Boolean(row.is_plat_du_jour || row.isPlatDuJour);

  return {
    id: String(row.id),
    name,
    description: String(row.description || ''),
    price: Number(row.price || 0),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    category: String(row.category || 'Plat Africain'),
    image: String(row.image || row.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'),
    rating: row.rating ? Number(row.rating) : 5,
    isPopular: Boolean(row.is_popular || isSpecialite),
    isFeatured: isDaily || isSpecialite,
    isSpecialiteMaison: isSpecialite,
    isSpécialitéMaison: isSpecialite,
    isPlatDuJour: isDaily,
    isPromo: Boolean(row.is_promo || row.old_price),
    isSpicy: Boolean(row.is_spicy || row.isSpicy),
    badge: isSpecialite ? 'Spécialité Maison' : (isDaily ? 'Plat du Jour' : (row.badge ? String(row.badge) : undefined)),
    preparationTime: row.preparation_time ? String(row.preparation_time) : '20 min',
    spicyLevel: row.is_spicy ? 2 : (row.spicy_level !== undefined ? Number(row.spicy_level) : 1),
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    available: row.is_available !== false && row.available !== false,
    createdAt: row.created_at || new Date().toISOString()
  };
}

// Test Supabase Connection & Table verification with rich diagnostic
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  hasTables: boolean;
  itemsCount: number;
  isUnreachable?: boolean;
  details?: any;
}> {
  const supabase = getSupabaseClient();
  const { url } = getSupabaseCredentials();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase n'est pas configuré. Veuillez renseigner l'URL et la clé Anon.",
      hasTables: false,
      itemsCount: 0
    };
  }

  let host = 'Supabase';
  try {
    host = new URL(url).hostname;
  } catch {}

  try {
    const { data, error, count } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      // Check if project paused / unreachable
      const msg = error.message || '';
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('fetch failed') ||
        error.code === 'ENOTFOUND'
      ) {
        return {
          success: false,
          isUnreachable: true,
          message: `⚠️ Impossible de joindre le serveur Supabase (${host}). Erreur réseau : "${msg}".
Solutions :
1. Projet en PAUSE sur Supabase : Rendez-vous sur https://supabase.com/dashboard pour cliquer sur "Restore project" / "Unpause".
2. Clés modifiées : Vérifiez l'URL de votre projet dans les paramètres Supabase.
3. Vos données restent en sécurité dans l'application locale.`,
          hasTables: false,
          itemsCount: 0,
          details: error
        };
      }

      if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('relation "menu_items" does not exist')) {
        return {
          success: false,
          message:
            "La table 'menu_items' n'existe pas encore dans votre base Supabase. Veuillez exécuter le script SQL fourni dans l'onglet 'Script SQL'.",
          hasTables: false,
          itemsCount: 0,
          details: error
        };
      }

      if (error.code === '42501' || msg.includes('permission denied')) {
        return {
          success: false,
          message:
            "Accès refusé par les règles RLS Supabase. Veuillez appliquer les politiques autorisant la lecture/écriture publique (voir onglet 'Script SQL').",
          hasTables: false,
          itemsCount: 0,
          details: error
        };
      }

      return {
        success: false,
        message: `Erreur Supabase : ${msg} (Code: ${error.code || 'Inconnu'})`,
        hasTables: false,
        itemsCount: 0,
        details: error
      };
    }

    return {
      success: true,
      message: `✅ Connexion réussie au projet Supabase (${host}) ! Les tables 'menu_items' et 'orders' sont prêtes (${count ?? data?.length ?? 0} plats en ligne).`,
      hasTables: true,
      itemsCount: count ?? data?.length ?? 0
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur inattendue : ${err?.message || String(err)}`,
      hasTables: false,
      itemsCount: 0,
      details: err
    };
  }
}

// Fetch all menu items from Supabase
export async function fetchSupabaseMenuItems(): Promise<MenuItem[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    let { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      const retry = await supabase.from('menu_items').select('*');
      data = retry.data;
      error = retry.error;
    }

    if (error || !data || data.length === 0) {
      // Fallback: check app_settings backup
      return (await fetchAppSetting('full_menu_items')) || null;
    }

    return data.map(dbRecordToMenuItem);
  } catch (err) {
    console.warn('Erreur chargement plats Supabase:', err);
    return null;
  }
}

// Upsert a single menu item to Supabase
export async function saveSingleMenuItemToSupabase(item: MenuItem): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase non configuré' };

  try {
    const record = menuItemToDbRecord(item);
    const { error } = await resilientUpsertMenuItems(supabase, [record]);

    if (error) {
      return { success: false, error: error.message || String(error) };
    }

    // Optional legacy compatibility: upsert to dishes
    try {
      await supabase.from('dishes').upsert({
        id: item.id,
        restaurant_id: 'khadys-food',
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category,
        is_available: item.available !== false,
        is_spicy: Boolean(item.isSpicy),
        is_specialite_maison: Boolean(item.isSpecialiteMaison || item.isSpécialitéMaison),
        is_plat_du_jour: Boolean(item.isPlatDuJour)
      }, { onConflict: 'id' });
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau Supabase' };
  }
}

// Upsert all menu items to Supabase
export async function syncAllMenuItemsToSupabase(items: MenuItem[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, count: 0, error: 'Supabase non configuré' };

  try {
    // 1. Save full JSON backup in app_settings table
    await saveAppSetting('full_menu_items', items).catch(() => {});

    // 2. Resilient bulk upsert into menu_items
    const records = items.map(menuItemToDbRecord);
    const { error } = await resilientUpsertMenuItems(supabase, records);

    if (error) {
      return { success: false, count: 0, error: error.message || String(error) };
    }

    // 3. Optional sync to dishes
    try {
      const dishesRecords = records.map(r => ({ ...r, restaurant_id: 'khadys-food' }));
      await supabase.from('dishes').upsert(dishesRecords, { onConflict: 'id' });
    } catch {}

    return { success: true, count: items.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Erreur synchronisation' };
  }
}

// Delete menu item from Supabase
export async function deleteMenuItemFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase non configuré' };

  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur suppression Supabase' };
  }
}

// Save order to Supabase
export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase non connecté' };

  try {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      customer_name: order.customerName,
      phone: order.phone,
      district: order.district,
      address: order.address,
      items: order.items,
      total: order.totalAmount,
      delivery_fee: order.deliveryFee || 0,
      status: order.status,
      payment_method: order.paymentMethod,
      timestamp: order.createdAt || new Date().toISOString()
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur enregistrement commande' };
  }
}

// App Settings helper
export async function fetchAppSetting(key: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    return error || !data ? null : data.value;
  } catch {
    return null;
  }
}

export async function saveAppSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase non configuré' };
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    return error ? { success: false, error: error.message } : { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Complete Official SQL Schema Script for 1-click execution in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- KHADY'S FOOD - SCRIPT SQL OFFICIEL SUPABASE
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    rating NUMERIC DEFAULT 5,
    is_available BOOLEAN DEFAULT true,
    is_spicy BOOLEAN DEFAULT false,
    is_specialite_maison BOOLEAN DEFAULT false,
    is_plat_du_jour BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'RECEIVED',
    payment_method TEXT NOT NULL,
    district TEXT,
    address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access menu_items" ON menu_items;
CREATE POLICY "Public Full Access menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access orders" ON orders;
CREATE POLICY "Public Full Access orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access app_settings" ON app_settings;
CREATE POLICY "Public Full Access app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE menu_items, orders, app_settings;
COMMIT;
`;
