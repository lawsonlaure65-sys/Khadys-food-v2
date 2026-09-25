export type CategoryType = 'tous' | 'incontournables' | 'plats' | 'sauces' | 'traiteur' | 'boissons' | 'entrees';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA (XOF)
  category: 'plats' | 'sauces' | 'traiteur' | 'boissons' | 'entrees';
  image: string;
  isPopular?: boolean;
  isFeatured?: boolean; // Display in Home Page "Incontournables" rectangles
  badge?: string;
  preparationTime?: string;
  spicyLevel?: number; // 0 to 3
  ingredients?: string[];
  available: boolean;
  createdAt?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  spice?: 'doux' | 'moyen' | 'pimenté';
  notes?: string;
}

export type PaymentMethod = 'cash' | 'airtel' | 'moov' | 'flooz' | 'card';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  district: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: 'received' | 'preparing' | 'on_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDeliveryMinutes: number;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  dishName?: string;
  avatar?: string;
  verified?: boolean;
}

export interface TraiteurPackage {
  id: string;
  title: string;
  tagline: string;
  pricePerPerson: number;
  minGuests: number;
  features: string[];
  popular?: boolean;
  image: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
