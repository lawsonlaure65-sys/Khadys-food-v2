import { MenuItem, Order } from '../types';
import { INITIAL_MENU_ITEMS } from '../constants';

const MENU_STORAGE_KEY = 'khadys_menu_items_v2';
const ORDERS_STORAGE_KEY = 'khadys_orders_v2';
const DRAFT_STORAGE_KEY = 'khadys_admin_item_draft';

export function loadStoredMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Erreur lors de la lecture du menu stocké:", err);
  }
  return INITIAL_MENU_ITEMS;
}

export function saveStoredMenuItems(items: MenuItem[]): boolean {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (err: any) {
    console.warn("Échec de sauvegarde locale (quota dépassé possible):", err);
    // If quota exceeded, try stripping heavy base64 images from very old items or notify
    try {
      // Emergency trim if needed
      const lightweight = items.map((item, idx) => {
        if (idx > 15 && item.image && item.image.startsWith('data:image')) {
          return { ...item, image: INITIAL_MENU_ITEMS[0].image };
        }
        return item;
      });
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(lightweight));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Erreur lors du chargement des commandes:", err);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn("Impossible d'enregistrer les commandes:", err);
  }
}

export function saveAdminDraft(draft: Partial<MenuItem> | null): void {
  try {
    if (!draft) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  } catch (err) {
    console.warn("Draft save failed:", err);
  }
}

export function loadAdminDraft(): Partial<MenuItem> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Draft load failed:", err);
  }
  return null;
}
