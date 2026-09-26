import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, CartItem, Order, ToastMessage } from './types';
import { INITIAL_MENU_ITEMS, RESTAURANT_INFO, isRestrictedFromDailyOrFeatured } from './constants';
import { loadStoredMenuItems, saveStoredMenuItems, loadStoredOrders, saveStoredOrders } from './utils/offlineDB';
import { Navbar } from './components/Navbar';
import { MenuView } from './components/MenuView';
import { TraiteurView } from './components/TraiteurView';
import { OrderTracking } from './components/OrderTracking';
import { AdminDashboard } from './components/AdminDashboard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { CartView } from './components/CartView';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceOrderModal } from './components/VoiceOrderModal';
import { PushNotificationsModal } from './components/PushNotificationsModal';
import { GalleryView } from './components/GalleryView';
import { Demo4kView } from './components/Demo4kView';
import { ProfileModal } from './components/ProfileModal';
import { BlogModal } from './components/BlogModal';
import { ContactModal } from './components/ContactModal';
import { KhadyOriginalLogo } from './components/KhadyOriginalLogo';
import {
  Sparkles, Star, Plus, Clock, ArrowRight, ShieldCheck, Heart,
  ShoppingBag, PhoneCall, MessageSquare, Mic, Bell, Send, ArrowUpRight,
  Zap, ChevronRight, ChevronLeft, Image as ImageIcon, BookOpen, Settings
} from 'lucide-react';

export const App: React.FC = () => {
  // Master reactive state for menu items (synced with offline storage)
  const [items, setItems] = useState<MenuItem[]>(() => loadStoredMenuItems());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => loadStoredOrders());
  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Modals & Panels state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPushOpen, setIsPushOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const list = loadStoredOrders();
    return list.length > 0 ? list[list.length - 1] : null;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref for smooth horizontal scrolling of rectangles
  const rectanglesContainerRef = useRef<HTMLDivElement>(null);

  // Brief initial splash display matching Screenshot 3
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Sync items changes to offline storage
  useEffect(() => {
    saveStoredMenuItems(items);
  }, [items]);

  // Sync orders to offline storage
  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Add to cart handler
  const handleAddToCart = (
    item: MenuItem,
    quantity = 1,
    spice?: 'doux' | 'moyen' | 'pimenté',
    notes?: string
  ) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.item.id === item.id && ci.spice === spice && ci.notes === notes);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { item, quantity, spice, notes }];
    });

    addToast('success', `${quantity}x ${item.name} ajouté(s)`, 'Visible dans votre panier');
  };

  // Admin dish handlers
  const handleSaveItem = (savedItem: MenuItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === savedItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedItem;
        return updated;
      } else {
        // Prepend so newly added dishes immediately appear first in the home rectangles!
        return [savedItem, ...prev];
      }
    });

    addToast('success', 'Plat enregistré !', `"${savedItem.name}" apparaît maintenant dans les rectangles de l'accueil.`);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    addToast('info', 'Plat supprimé', 'Le menu a été mis à jour.');
  };

  const handleToggleAvailability = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const handleToggleFeatured = (id: string) => {
    const dish = items.find(i => i.id === id);
    if (dish && !dish.isFeatured && isRestrictedFromDailyOrFeatured(dish.name)) {
      addToast('error', 'Action non autorisée', "L'Attiéké et le Doukounou restent dans la carte permanente mais ne peuvent pas être définis comme plat vedette ou plat du jour.");
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFeatured: !i.isFeatured } : i));
  };

  // Cart operations
  const handleUpdateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter((_, i) => i !== idx));
    } else {
      setCart(prev => {
        const next = [...prev];
        next[idx].quantity = newQty;
        return next;
      });
    }
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOrderPlaced = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveOrder(order);
    setCart([]);
    setIsCartOpen(false);
    setActiveTab('suivi');
    addToast('success', 'Commande validée avec succès !', `Réf #${order.id} - En cours de préparation`);
  };

  // Horizontal scroll buttons for Incontournables
  const scrollRectangles = (direction: 'left' | 'right') => {
    if (rectanglesContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      rectanglesContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // The featured items for the Home page rectangles:
  // Attiéké and Doukounou are strictly excluded from plat vedette / incontournables rectangles,
  // but remain 100% visible and orderable in the regular carte!
  const displayedIncontournables = items
    .filter(it => (it.isFeatured || it.isPopular) && !isRestrictedFromDailyOrFeatured(it.name))
    .concat(items.filter(it => !it.isFeatured && !it.isPopular && !isRestrictedFromDailyOrFeatured(it.name)));

  return (
    <ErrorBoundary fallbackTitle="Une erreur inattendue est survenue dans l'application">
      {/* 1. Splash Screen matching Screenshot 3 */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-[#35201A] flex items-center justify-center animate-fade-out pointer-events-none">
          <div className="text-center space-y-4 animate-scale-up">
            <KhadyOriginalLogo size={180} withSquircle={true} className="shadow-2xl mx-auto" />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#110E0C] text-[#F7F4EE] flex flex-col font-sans selection:bg-orange-600 selection:text-white pb-36 sm:pb-32 md:pb-16 w-full max-w-full overflow-x-hidden">
        {/* Navigation Bar matching Screenshot 1 & 2 */}
        <Navbar
          currentTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={cart.reduce((sum, ci) => sum + ci.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenNotifications={() => setIsPushOpen(true)}
          onOpenProfile={() => setIsAdminOpen(true)} // Directly opens Admin console or Profile
        />

        {/* Content View Switching */}
        <main className="flex-1">
          {activeTab === 'accueil' && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-5 sm:space-y-6">
              
              {/* 1. HERO CARD (Screenshot 1 & 2: "L'EXCELLENCE À NIAMEY", "LE GOÛT DES ROIS", "COMMANDER MAINTENANT ↗") */}
              <section className="relative rounded-[34px] sm:rounded-[38px] overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-[#19120E] aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[460px]">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=85"
                  alt="Le Goût des Rois - Grillades Khady"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25" />

                <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-between z-10">
                  {/* Top Badge */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E65100] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      L'EXCELLENCE À NIAMEY
                    </span>
                  </div>

                  {/* Headline & CTA */}
                  <div className="space-y-3.5 max-w-xl">
                    <div>
                      <h1 className="font-black italic uppercase tracking-tight leading-[0.92] drop-shadow-2xl font-display">
                        <span className="block text-3xl sm:text-5xl md:text-6xl text-white">
                          LE GOÛT
                        </span>
                        <span className="block text-3xl sm:text-5xl md:text-6xl text-[#FFD700]">
                          DES ROIS
                        </span>
                      </h1>
                      <p className="text-xs sm:text-sm text-stone-200 font-medium drop-shadow mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                        Cuisine fraîche, livraison et service traiteur à Niamey
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a
                        href={RESTAURANT_INFO.whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-3 px-5 sm:px-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-white" />
                        <span>COMMANDER SUR WHATSAPP</span>
                      </a>
                      <button
                        onClick={() => setActiveTab('carte')}
                        className="inline-flex items-center justify-center gap-2 py-3 px-5 sm:px-7 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        <span>VOIR LA CARTE</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-900" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. WHATSAPP PRE-ORDER & CATALOG CARD */}
              <section className="rounded-[28px] bg-gradient-to-r from-[#062419] via-[#092F20] to-[#051C13] border border-emerald-500/40 p-4 sm:p-5 shadow-xl transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-5">
                    {/* Emerald WhatsApp Icon Box */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
                      <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                        📞 SERVICE TRAITEUR & REPAS
                      </span>
                      <h2 className="text-white font-black italic uppercase text-xs sm:text-base tracking-wide mt-1 leading-snug">
                        PRÉCOMMANDE SUR LE NUMÉRO WHATSAPP DU RESTAURANT
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                        <span className="text-emerald-400 font-bold font-mono">
                          WhatsApp : +227 74 44 16 21
                        </span>
                        <span className="text-teal-300 font-medium">
                          • Commande & Devis direct
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Discuter & Catalogue */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1 md:pt-0">
                    <a
                      href={RESTAURANT_INFO.whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Discuter avec le restaurant</span>
                    </a>

                    <a
                      href={RESTAURANT_INFO.whatsappCatalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider shadow transition-transform active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Catalogue WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </section>

              {/* 3. TWO FEATURE CARDS (Screenshot 1 & 2: "COMMANDE VOCALE / IA VOCALE" & "NOTIFICATIONS PUSH / SUIVI PWA") */}
              <section className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Left Card: IA VOCALE */}
                <div
                  onClick={() => setIsVoiceOpen(true)}
                  className="rounded-[28px] bg-gradient-to-br from-amber-600 via-orange-600 to-orange-700 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider">
                      IA VOCALE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-xs sm:text-base uppercase tracking-tight leading-tight flex items-center gap-1">
                      COMMANDE VOCALE 🎙️
                    </h3>
                    <p className="text-[10px] sm:text-xs text-white/90 font-medium mt-1 leading-tight">
                      DICTEZ VOTRE REPAS AU MICRO
                    </p>
                  </div>
                </div>

                {/* Right Card: SUIVI PWA */}
                <div
                  onClick={() => setIsPushOpen(true)}
                  className="rounded-[28px] bg-[#231712] border border-amber-500/40 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                      SUIVI PWA
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-xs sm:text-base uppercase tracking-tight leading-tight text-amber-400 flex items-center gap-1">
                      NOTIFICATIONS PUSH 🔔
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-300 font-medium mt-1 leading-tight">
                      ALERTES LIVRAISON TEMPS RÉEL
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. FOUR WHITE SQUIRCLE PILLS (Screenshot 5: WHATSAPP, GALERIE, BLOG, CONTACT) */}
              <section className="grid grid-cols-4 gap-2 sm:gap-3">
                {/* 1. WHATSAPP */}
                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-[24px] p-2.5 sm:p-4 shadow-lg text-center flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1 group-hover:bg-emerald-200 transition-colors">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black italic uppercase text-stone-900 block truncate">
                    WHATSAPP
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 block uppercase tracking-wider truncate">
                    COMMANDE DIRECTE
                  </span>
                </a>

                {/* 2. GALERIE */}
                <button
                  onClick={() => setActiveTab('galerie')}
                  className="bg-white rounded-[24px] p-2.5 sm:p-4 shadow-lg text-center flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-1 group-hover:bg-amber-200 transition-colors">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black italic uppercase text-stone-900 block truncate">
                    GALERIE
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 block uppercase tracking-wider truncate">
                    PHOTOS PLATS
                  </span>
                </button>

                {/* 3. BLOG */}
                <button
                  onClick={() => setIsBlogOpen(true)}
                  className="bg-white rounded-[24px] p-2.5 sm:p-4 shadow-lg text-center flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-800 mb-1 group-hover:bg-stone-300 transition-colors">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black italic uppercase text-stone-900 block truncate">
                    BLOG
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 block uppercase tracking-wider truncate">
                    RECETTES & ASTUCES
                  </span>
                </button>

                {/* 4. CONTACT */}
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="bg-white rounded-[24px] p-2.5 sm:p-4 shadow-lg text-center flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-800 mb-1 group-hover:bg-stone-300 transition-colors">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black italic uppercase text-stone-900 block truncate">
                    CONTACT
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 block uppercase tracking-wider truncate">
                    FAQ & INFOS
                  </span>
                </button>
              </section>

              {/* 5. MOBILE MONEY BANNER (Screenshot 5: PAIEMENT SÉCURISÉ MOBILE MONEY) */}
              <section className="rounded-[28px] bg-[#221B17] border-2 border-amber-500/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 block">
                      PAIEMENT SÉCURISÉ MOBILE MONEY
                    </span>
                    <h3 className="font-black italic uppercase text-white text-xs sm:text-sm tracking-wide mt-0.5 leading-snug">
                      ZAMANY MONEY (ORANGE), MYNITA, AMANATA, ALL-IZA, ZEYNAB, AIRTEL, MOOV
                    </h3>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mt-0.5">
                      DOUBLE NOTIFICATION WHATSAPP & IN-APP
                    </span>
                  </div>

                  <div className="text-amber-400 flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
              </section>

              {/* 6. MENU DU JOUR — LE TRIO GOURMAND (Screenshot 4 & 5) */}
              <section className="rounded-[32px] bg-gradient-to-b from-[#2B1B14] via-[#201511] to-[#17100D] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4">
                {/* Header tags */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
                      ☀️ MENU DU JOUR
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#E2B124] text-stone-950 text-[11px] font-black uppercase tracking-wider shadow">
                      👑 LE TRIO GOURMAND QUOTIDIEN
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-300 text-[11px] font-bold">
                      Demain Jeudi Midi
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white font-display">
                      MENU DU JOUR — LE TRIO GOURMAND
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                      Le grand classique sénégalais au poisson capitaine braisé, riz rouge subtilement parfumé à la tomate et épices douces, chou blanc, carottes et manioc fondants.
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      🎁 3 Emplacements Cuisinés Frais
                    </span>
                  </div>
                </div>

                {/* Dish Card Inside (Screenshot 4) */}
                <div className="pt-2">
                  <div className="w-full h-1 bg-orange-600 rounded-full mb-3" />
                  <div className="rounded-[26px] bg-[#1F1714] border border-amber-500/30 p-3.5 sm:p-4 space-y-3">
                    <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 w-full">
                      <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
                        alt="Tiep Rouge Royal"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#E65100] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                        🍲 PLAT CUISINÉ DU JOUR
                      </span>
                      <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/80 text-white text-xs font-black flex items-center justify-center border border-white/20">
                        #1
                      </span>
                      <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 text-amber-300 text-xs font-bold backdrop-blur-sm border border-amber-500/30">
                        25 restants
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg sm:text-xl font-black italic uppercase text-[#FFD700] font-display">
                        TIEP ROUGE ROYAL
                      </h3>
                      <p className="text-xs font-bold italic text-amber-200">
                        "Le grand classique sénégalais au poisson capitaine braisé..."
                      </p>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        Le grand classique sénégalais au poisson capitaine braisé, riz rouge subtilement parfumé à la tomate et épices douces, chou blanc, carottes et manioc fondants.
                      </p>
                    </div>

                    {/* Éléments inclus dans le plat */}
                    <div className="pt-1.5 pb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block mb-1">
                        ✨ Ingrédients & Éléments Inclus :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Poisson capitaine braisé",
                          "Riz rouge subtilement parfumé à la tomate",
                          "Chou blanc & carottes fondantes",
                          "Manioc mijoté",
                          "Épices douces Khady",
                          "Sauce piment maison"
                        ].map((ing, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-stone-900 border border-amber-500/20 text-stone-300 text-[10px] font-medium"
                          >
                            • {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800">
                      <div className="text-base sm:text-lg font-black text-amber-400">
                        4 950 F CFA
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/22774441621?text=Bonjour%20Khady%27s%20Food%2C%20je%20commande%20le%20Tiep%20Rouge%20Royal%20(4%20950%20FCFA)%20du%20Menu%20du%20Jour%20!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                          title="Commander par WhatsApp direct"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            const thieb = items.find(i => i.id === 'item-thieb-rouge') || items[0];
                            handleAddToCart(thieb, 1, 'moyen');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                        >
                          <span>COMMANDER</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 7. LA CARTE DU RESTAURANT SECTION (Screenshot 6 & 7) */}
              <section className="rounded-[32px] bg-[#1E1714] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="text-center space-y-3">
                  <h3 className="text-base sm:text-lg font-black italic uppercase tracking-wider text-[#FFD700] font-display">
                    LA CARTE DU RESTAURANT
                  </h3>

                  {/* 2 Big Buttons: BUFFET PRO & BOX SAUCES (Screenshot 6) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('traiteur')}
                      className="py-3 px-4 rounded-full bg-[#E2B124] hover:bg-[#F0BF2D] text-stone-950 font-black italic uppercase text-xs sm:text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      BUFFET PRO
                    </button>
                    <button
                      onClick={() => {
                        const sauce = items.find(i => i.category === 'sauces') || items[0];
                        setSelectedItemForModal(sauce);
                      }}
                      className="py-3 px-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-black italic uppercase text-xs sm:text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      BOX SAUCES
                    </button>
                  </div>

                  {/* Wide White Button: EVENT & DEVIS TRAITEUR (Screenshot 6) */}
                  <div>
                    <button
                      onClick={() => setActiveTab('traiteur')}
                      className="w-full py-3 px-6 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-black italic uppercase text-xs sm:text-sm tracking-wider shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
                    >
                      EVENT & DEVIS TRAITEUR
                    </button>
                  </div>
                </div>
              </section>

              {/* 8. INCONTOURNABLES — THE EXACT LIGHT-GREY RECTANGLES (Screenshot 6 & 7) */}
              <section className="space-y-4 pt-2">
                {/* Header with Heart Icon & TOUT VOIR */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2A1D17] border border-orange-500/30 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black italic uppercase tracking-widest text-[#B5A59E] font-display">
                      INCONTOURNABLES
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 font-bold text-xs hover:bg-orange-600/30 flex items-center gap-1"
                      title="Ajouter un plat dans ces rectangles"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter plat</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('carte')}
                      className="text-xs font-black italic uppercase text-[#E65100] hover:text-orange-400 transition-colors"
                    >
                      TOUT VOIR
                    </button>
                  </div>
                </div>

                {/* THE FAMOUS RECTANGLES CAROUSEL / ROW (Exact light-grey rounded rectangles from Screenshot 6 & 7) */}
                <div className="relative group">
                  {/* Navigation arrows for desktop */}
                  <button
                    onClick={() => scrollRectangles('left')}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-900/90 text-white shadow-xl border border-stone-700 hidden sm:flex items-center justify-center hover:bg-orange-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => scrollRectangles('right')}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-stone-900/90 text-white shadow-xl border border-stone-700 hidden sm:flex items-center justify-center hover:bg-orange-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div
                    ref={rectanglesContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory no-scrollbar"
                  >
                    {displayedIncontournables.map((dish) => (
                      <div
                        key={dish.id}
                        onClick={() => setSelectedItemForModal(dish)}
                        className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start cursor-pointer rounded-[34px] sm:rounded-[38px] bg-[#C8C8CE] hover:bg-[#D5D5DC] p-3.5 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group"
                      >
                        {/* Food Image (large & rounded) */}
                        <div className="relative h-48 sm:h-52 w-full rounded-[26px] sm:rounded-[28px] overflow-hidden bg-stone-300 shadow-inner">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        </div>

                        {/* Title & Price Row */}
                        <div className="pt-3 pb-1 space-y-2">
                          <h4 className="font-black italic uppercase text-stone-950 text-xs sm:text-sm tracking-wide truncate">
                            {dish.name}
                          </h4>

                          <div className="flex items-center justify-between">
                            {/* Peach/light orange price pill */}
                            <span className="px-3.5 py-1 rounded-full bg-[#EAA688] text-[#802506] font-black text-xs shadow-sm">
                              {(dish.price || 0).toLocaleString()} F
                            </span>

                            {/* 4 Gold Stars + 1 Empty Star */}
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                              <span>★</span>
                              <span>★</span>
                              <span>★</span>
                              <span>★</span>
                              <span className="text-stone-400">☆</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>
          )}

          {activeTab === 'carte' && (
            <MenuView
              items={items}
              onSelectItem={setSelectedItemForModal}
              onQuickAdd={(item, e) => handleAddToCart(item, 1, 'moyen')}
            />
          )}

          {activeTab === 'traiteur' && (
            <TraiteurView />
          )}

          {activeTab === 'galerie' && (
            <GalleryView />
          )}

          {activeTab === 'demo4k' && (
            <Demo4kView />
          )}

          {activeTab === 'suivi' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <OrderTracking
                order={activeOrder}
                onNewOrder={() => setActiveTab('carte')}
              />
            </div>
          )}
        </main>

        {/* FLOATING WHATSAPP BUTTON (Bottom Right with badge 1 from Screenshots) */}
        <a
          href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=Bonjour%20Khady%27s%20Food%20%26%20Event%2C%20je%20souhaite%20commander%20!`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="WhatsApp direct Khady's Food"
        >
          <MessageSquare className="w-7 h-7 text-white fill-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFD700] text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
            1
          </span>
        </a>

        {/* MODALS & OVERLAYS */}
        {selectedItemForModal && (
          <ItemDetailsModal
            item={selectedItemForModal}
            onClose={() => setSelectedItemForModal(null)}
            onAddToCart={(item, qty, spice, notes) => {
              handleAddToCart(item, qty, spice, notes);
              setSelectedItemForModal(null);
            }}
          />
        )}

        {isCartOpen && (
          <CartView
            items={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={() => setCart([])}
            onClose={() => setIsCartOpen(false)}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {isAdminOpen && (
          <AdminDashboard
            items={items}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onToggleAvailability={handleToggleAvailability}
            onToggleFeatured={handleToggleFeatured}
            orders={orders}
            onClose={() => setIsAdminOpen(false)}
          />
        )}

        <VoiceOrderModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          items={items}
          onAddToCart={(item, qty) => handleAddToCart(item, qty || 1, 'moyen')}
        />

        <PushNotificationsModal
          isOpen={isPushOpen}
          onClose={() => setIsPushOpen(false)}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          orders={orders}
          onOpenAdmin={() => {
            setIsProfileOpen(false);
            setIsAdminOpen(true);
          }}
          onOpenOrderTracking={(ord) => {
            setActiveOrder(ord);
            setIsProfileOpen(false);
            setActiveTab('suivi');
          }}
        />

        <BlogModal
          isOpen={isBlogOpen}
          onClose={() => setIsBlogOpen(false)}
        />

        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          onOpenAdmin={() => {
            setIsContactOpen(false);
            setIsAdminOpen(true);
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      </div>
    </ErrorBoundary>
  );
};
export default App;
