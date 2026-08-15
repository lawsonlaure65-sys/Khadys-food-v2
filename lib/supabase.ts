
import { createClient } from '@supabase/supabase-js';
import { MenuItem, Order } from '../types';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const customUrl = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_url') || '' : '';
const customKey = typeof window !== 'undefined' ? localStorage.getItem('khadys_custom_supabase_key') || '' : '';

const supabaseUrl = customUrl || envUrl;
const supabaseKey = customKey || envKey;

export const isSupabaseConfigured = 
  Boolean(supabaseUrl) &&
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('votre_projet') &&
  !supabaseUrl.includes('example') &&
  Boolean(supabaseKey) &&
  supabaseKey.length > 20 &&
  !supabaseKey.includes('votre_cle');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * SERVICE DE DONNÉES KHADY'S ELITE
 * Gère la synchronisation bidirectionnelle Cloud & Temps Réel
 */
export const db = {
  // --- MENU ---
  fetchMenu: async (): Promise<MenuItem[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      if (error) {
        console.warn('⚠️ Supabase fetchMenu error:', error.message);
        return null;
      }
      if (!data) return null;
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
    } catch (e: any) {
      console.warn('⚠️ Exception Supabase fetchMenu:', e);
      return null;
    }
  },

  saveMenuItem: async (item: MenuItem): Promise<{ success: boolean; error?: string; data?: any }> => {
    if (!supabase) return { success: false, error: 'Supabase non configuré' };
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

      const { data, error } = await supabase
        .from('menu_items')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('❌ Erreur Supabase saveMenuItem:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (e: any) {
      console.error('❌ Exception Supabase saveMenuItem:', e);
      return { success: false, error: e.message || 'Erreur inconnue' };
    }
  },

  syncAllMenuItems: async (items: MenuItem[]): Promise<{ success: boolean; error?: string; count: number }> => {
    if (!supabase) return { success: false, error: 'Supabase non configuré', count: 0 };
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

      const { data, error } = await supabase
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
    if (!supabase) return { success: false, error: 'Supabase non configuré' };
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        console.error('❌ Erreur Supabase deleteMenuItem:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // --- COMMANDES ---
  fetchOrders: async (): Promise<Order[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
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
    if (!supabase) return { success: false, error: 'Supabase non connecté' };
    try {
      const { data, error } = await supabase
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
        })
        .select();
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
    if (!supabase) return null;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) return null;
    } catch {
      return null;
    }
  }
};
