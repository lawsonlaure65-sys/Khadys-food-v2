import { MenuItem, Order } from '../types';
import { INITIAL_MENU_ITEMS, isRestrictedFromDailyOrFeatured } from '../constants';

const MENU_STORAGE_KEY = 'khadys_menu_items_v3';
const ORDERS_STORAGE_KEY = 'khadys_orders_v2';
const DRAFT_STORAGE_KEY = 'khadys_admin_item_draft';

// Safe wrapper to prevent DOMException in restricted/private browser modes
function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, val: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, val);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredMenuItems(): MenuItem[] {
  try {
    const raw = safeGetItem(MENU_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deep sanitization of every entry to guarantee no missing property crashes the UI
        const validItems = parsed
          .filter(it => it && typeof it === 'object' && it.id && it.name)
          .map((it: any) => {
            const name = String(it.name || '').trim();
            const isRestricted = isRestrictedFromDailyOrFeatured(name);
            const price = typeof it.price === 'number' && !isNaN(it.price) && it.price > 0 ? it.price : 3000;

            const sanitized: MenuItem = {
              id: String(it.id),
              name: name || "Plat Khady's",
              description: String(it.description || ''),
              price,
              category: ['plats', 'sauces', 'entrees', 'boissons', 'traiteur'].includes(it.category)
                ? it.category
                : 'plats',
              image: typeof it.image === 'string' && it.image.length > 5
                ? it.image
                : INITIAL_MENU_ITEMS[0].image,
              isPopular: Boolean(it.isPopular),
              isFeatured: isRestricted ? false : Boolean(it.isFeatured),
              badge: isRestricted ? 'Spécialité Permanente' : String(it.badge || ''),
              preparationTime: String(it.preparationTime || '20 min'),
              spicyLevel: typeof it.spicyLevel === 'number' ? it.spicyLevel : 1,
              ingredients: Array.isArray(it.ingredients) ? it.ingredients.map(String) : [],
              available: it.available !== false,
              createdAt: String(it.createdAt || new Date().toISOString())
            };
            return sanitized;
          });

        if (validItems.length > 0) {
          return validItems;
        }
      }
    }
  } catch (err) {
    console.error("Erreur lors de la lecture du menu stocké:", err);
  }
  return INITIAL_MENU_ITEMS;
}

export function saveStoredMenuItems(items: MenuItem[]): boolean {
  try {
    if (!Array.isArray(items)) return false;
    const ok = safeSetItem(MENU_STORAGE_KEY, JSON.stringify(items));
    if (ok) return true;

    // If quota exceeded, strip heavy base64 strings from older items
    const lightweight = items.map((item, idx) => {
      if (idx > 12 && item.image && item.image.startsWith('data:image')) {
        return { ...item, image: INITIAL_MENU_ITEMS[0].image };
      }
      return item;
    });
    return safeSetItem(MENU_STORAGE_KEY, JSON.stringify(lightweight));
  } catch {
    return false;
  }
}

export function loadStoredOrders(): Order[] {
  try {
    const raw = safeGetItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(o => o && typeof o === 'object' && o.id)
          .map((o: any) => ({
            id: String(o.id),
            customerName: String(o.customerName || 'Client Khady'),
            phone: String(o.phone || '+227 74 44 16 21'),
            district: String(o.district || 'Plateau'),
            address: String(o.address || 'Niamey'),
            items: Array.isArray(o.items)
              ? o.items.map((ci: any) => ({
                  item: ci?.item ? {
                    id: String(ci.item.id || 'item-unknown'),
                    name: String(ci.item.name || 'Plat'),
                    description: String(ci.item.description || ''),
                    price: typeof ci.item.price === 'number' && !isNaN(ci.item.price) ? ci.item.price : 0,
                    category: ci.item.category || 'plats',
                    image: ci.item.image || INITIAL_MENU_ITEMS[0].image,
                    available: ci.item.available !== false
                  } : INITIAL_MENU_ITEMS[0],
                  quantity: typeof ci?.quantity === 'number' && ci.quantity > 0 ? ci.quantity : 1,
                  spice: ci?.spice,
                  notes: ci?.notes ? String(ci.notes) : undefined
                }))
              : [],
            subtotal: typeof o.subtotal === 'number' ? o.subtotal : 0,
            deliveryFee: typeof o.deliveryFee === 'number' ? o.deliveryFee : 0,
            totalAmount: typeof o.totalAmount === 'number' ? o.totalAmount : 0,
            paymentMethod: o.paymentMethod || 'cash',
            status: o.status || 'received',
            createdAt: String(o.createdAt || new Date().toISOString()),
            estimatedDeliveryMinutes: typeof o.estimatedDeliveryMinutes === 'number' ? o.estimatedDeliveryMinutes : 35,
            driverName: String(o.driverName || 'Moussa (Livreur Khady)'),
            driverPhone: String(o.driverPhone || '+227 90 12 34 56'),
            notes: o.notes ? String(o.notes) : undefined
          } as Order));
      }
    }
  } catch (err) {
    console.error("Erreur lors du chargement des commandes:", err);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    if (!Array.isArray(orders)) return;
    safeSetItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn("Impossible d'enregistrer les commandes:", err);
  }
}

export function saveAdminDraft(draft: Partial<MenuItem> | null): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (!draft) {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  } catch {}
}

export function loadAdminDraft(): Partial<MenuItem> | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
