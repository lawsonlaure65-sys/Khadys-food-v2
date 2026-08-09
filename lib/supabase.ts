
import { createClient } from '@supabase/supabase-js';
import { MenuItem, Order } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

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
 * Gère la synchronisation entre l'App et le Cloud
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
      if (error || !data) return null;
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
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

  saveMenuItem: async (item: MenuItem) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          rating: item.rating,
          is_available: item.isAvailable,
          is_spicy: item.isSpicy,
          is_specialite_maison: item.isSpécialitéMaison
        })
        .select();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  deleteMenuItem: async (id: string) => {
    if (!supabase) return null;
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) return null;
    } catch {
      return null;
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

  placeOrder: async (order: Order) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          customer_name: order.customerName,
          phone: order.phone,
          items: order.items,
          total: order.total,
          delivery_fee: order.deliveryFee,
          status: order.status,
          payment_method: order.paymentMethod,
          timestamp: order.timestamp,
          district: order.district,
          address: order.address
        })
        .select();
      if (error) return null;
      return data;
    } catch {
      return null;
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
