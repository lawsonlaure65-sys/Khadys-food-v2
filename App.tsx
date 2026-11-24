import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MenuItem, CartItem, Order, ToastMessage, Review } from './types';
import { INITIAL_MENU_ITEMS, RESTAURANT_INFO, isRestrictedFromDailyOrFeatured } from './constants';
import {
  loadStoredMenuItems,
  saveStoredMenuItems,
  loadStoredOrders,
  saveStoredOrders,
  loadStoredReviews,
  saveStoredReviews,
  loadPlatDuJourVisible,
  savePlatDuJourVisible,
  getAdminPin
} from './utils/offlineDB';
import { Navbar } from './components/Navbar';
import { MenuView } from './components/MenuView';
import { TraiteurView } from './components/TraiteurView';
import { OrderTracking } from './components/OrderTracking';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { CartView } from './components/CartView';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VoiceOrderModal } from './components/VoiceOrderModal';
import { PushNotificationsModal } from './components/PushNotificationsModal';
import { GalleryView } from './components/GalleryView';
import { ProfileModal } from './components/ProfileModal';
import { BlogModal } from './components/BlogModal';
import { ContactModal } from './components/ContactModal';
import { KhadyOriginalLogo } from './components/KhadyOriginalLogo';
import { GourmetReviewsSection } from './components/GourmetReviewsSection';
import { HomeSpecialSections } from './components/HomeSpecialSections';
import { saveOrderToSupabase, fetchSupabaseMenuItems, saveSingleMenuItemToSupabase } from './utils/supabaseClient';
import {
  Sparkles, Plus, ArrowRight, ShieldCheck, Heart,
  ShoppingBag, MessageSquare, Mic, Bell, ArrowUpRight,
  Zap, Image as ImageIcon, BookOpen, Settings, Lock, X
} from 'lucide-react';

const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);

export const App: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>(() => loadStoredMenuItems());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => loadStoredOrders());
  const [reviews, setReviews] = useState<Review[]>(() => loadStoredReviews());
  const [isPlatDuJourVisible, setIsPlatDuJourVisible] = useState<boolean>(() => loadPlatDuJourVisible());

  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('tous');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Modals & Panels state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPushOpen, setIsPushOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const list = loadStoredOrders();
    return list.length > 0 ? list[0] : null;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);

  // Splash screen display
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 950);
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

  // Sync reviews to offline storage
  useEffect(() => {
    saveStoredReviews(reviews);
  }, [reviews]);

  // Background fetch from Supabase if reachable
  useEffect(() => {
    fetchSupabaseMenuItems()
      .then(cloudItems => {
        if (cloudItems && cloudItems.length > 0) {
          setItems(prev => {
            const map = new Map<string, MenuItem>();
            cloudItems.forEach(it => map.set(it.id, it));
            prev.forEach(it => {
              if (!map.has(it.id)) map.set(it.id, it);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(err => {
        console.warn('Supabase initial fetch silent fallback:', err);
      });
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const requestAdminAccess = () => {
    if (isAdminUnlocked) {
      setIsAdminOpen(true);
    } else {
      setPinInput('');
      setPinError(null);
      setIsPinPromptOpen(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === getAdminPin()) {
      setIsAdminUnlocked(true);
      setIsPinPromptOpen(false);
      setPinInput('');
      setPinError(null);
      setIsAdminOpen(true);
    } else {
      setPinError('Code PIN incorrect.');
    }
  };

  const handleSaveReview = (review: Review) => {
    setReviews(prev => {
      const idx = prev.findIndex(r => r.id === review.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = review;
        return next;
      }
      return [review, ...prev];
    });
    addToast('success', 'Avis enregistré !', `Merci ${review.author} pour votre retour.`);
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    addToast('info', 'Avis supprimé', 'La liste des avis a été mise à jour.');
  };

  const handleToggleVerifiedReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, verified: !r.verified } : r));
    addToast('success', 'Statut mis à jour', 'Badge vérifié modifié.');
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity = 1,
    spice?: 'doux' | 'moyen' | 'pimenté',
    notes?: string
  ) => {
    if (!item || !item.id) return;
    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.item?.id === item.id && ci.spice === spice && ci.notes === notes);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { item, quantity, spice, notes }];
    });

    addToast('success', `${quantity}x ${item.name || 'Plat'} ajouté(s)`, 'Visible dans votre panier');
  };

  const handleSaveItem = (savedItem: MenuItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === savedItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedItem;
        return updated;
      }
      return [savedItem, ...prev];
    });
    addToast('success', 'Plat enregistré !', `"${savedItem.name}" mis à jour dans la carte.`);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    addToast('info', 'Plat supprimé', 'Le menu a été mis à jour.');
  };

  const handleToggleAvailability = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: i.available === false } : i));
  };

  const handleToggleFeatured = (id: string) => {
    const dish = items.find(i => i.id === id);
    if (dish && !dish.isFeatured && isRestrictedFromDailyOrFeatured(dish.name)) {
      addToast('error', 'Action non autorisée', "L'Attiéké et le Doukounou restent dans la carte permanente.");
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFeatured: !i.isFeatured } : i));
  };

  const handleSetPlatDuJour = (id: string) => {
    const target = items.find(i => i.id === id);
    if (!target || isRestrictedFromDailyOrFeatured(target.name)) return;

    setItems(prev =>
      prev.map(i => {
        if (i.id === id) {
          const updated = { ...i, isPlatDuJour: true, isFeatured: true, badge: 'Plat du Jour' };
          saveSingleMenuItemToSupabase(updated).catch(() => {});
          return updated;
        }
        if (i.isPlatDuJour) {
          return { ...i, isPlatDuJour: false, badge: i.isSpecialiteMaison ? 'Spécialité Maison' : '' };
        }
        return i;
      })
    );
    addToast('success', 'Plat du Jour mis à jour', `${target.name} est maintenant en une.`);
  };

  const handleTogglePlatDuJourVisible = () => {
    setIsPlatDuJourVisible(prev => {
      const next = !prev;
      savePlatDuJourVisible(next);
      return next;
    });
  };

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
    saveOrderToSupabase(order).catch(e => console.warn('Supabase save order fallback:', e));
    setActiveOrder(order);
    setCart([]);
    setIsCartOpen(false);
    setActiveTab('suivi');
    addToast('success', 'Commande validée avec succès !', `Réf #${order.id}`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder(prev => (prev ? { ...prev, status } : prev));
    }
    addToast('info', `Commande #${orderId}`, `Statut mis à jour : ${status}`);
  };

  // Active Plat du Jour from real items state (excluding Doukounou / Attiéké)
  const activePlatDuJour =
    (items || []).find(i => i && i.available !== false && i.isPlatDuJour && !isRestrictedFromDailyOrFeatured(i.name)) ||
    (items || []).find(i => i && i.available !== false && i.isFeatured && !isRestrictedFromDailyOrFeatured(i.name)) ||
    (items || []).find(i => i && i.available !== false && !isRestrictedFromDailyOrFeatured(i.name)) ||
    INITIAL_MENU_ITEMS[2];

  // Featured available dishes for Home Incontournables carousel
  const displayedIncontournables = (items || [])
    .filter(it => it && it.available !== false && (it.isFeatured || it.isPopular) && !isRestrictedFromDailyOrFeatured(it.name))
    .concat(
      (items || []).filter(
        it => it && it.available !== false && !it.isFeatured && !it.isPopular && !isRestrictedFromDailyOrFeatured(it.name)
      )
    );

  const navigateToMenuCategory = (cat: string) => {
    setMenuFilterCategory(cat);
    setActiveTab('carte');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary fallbackTitle="Une erreur inattendue est survenue dans l'application">
      {/* Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-[#35201A] flex items-center justify-center animate-fade-out pointer-events-none">
          <div className="text-center space-y-4 animate-scale-up">
            <KhadyOriginalLogo size={180} withSquircle={true} className="shadow-2xl mx-auto" />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#110E0C] text-[#F7F4EE] flex flex-col font-sans selection:bg-orange-600 selection:text-white pb-24 sm:pb-28 w-full max-w-full overflow-x-hidden">
        <Navbar
          currentTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'carte') setMenuFilterCategory('tous');
            setActiveTab(tab);
          }}
          cartCount={cart.reduce((sum, ci) => sum + (Number(ci?.quantity) || 1), 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenNotifications={() => setIsPushOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenBlog={() => setIsBlogOpen(true)}
        />

        <main className="flex-1 pb-[150px] w-full max-w-full min-w-0">
          {activeTab === 'accueil' && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-5 sm:space-y-6">

              {/* 0. WELCOME GREETING BANNER */}
              <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2A1810] via-[#1E1410] to-[#2A1810] border border-amber-500/40 p-3 sm:p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="animate-wave text-2xl sm:text-3xl select-none inline-block flex-shrink-0 cursor-default" title="Bonjour ! Barka ! Fofo !">
                      👋🏾
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                          Bonjour ! Barka ! Fofo ! Salam !
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-600/30 border border-orange-500/40 text-[10px] font-bold text-orange-200 uppercase">
                          Bienvenue à Niamey
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-300 font-medium mt-0.5 truncate">
                        Khady's Food vous souhaite la bienvenue au cœur des saveurs africaines authentiques.
                      </p>
                    </div>
                  </div>
                  <span className="animate-wave-alt text-2xl sm:text-3xl select-none hidden sm:inline-block flex-shrink-0 cursor-default" title="Barka da zuwa ! Fofo n'goy !">
                    👋🏾
                  </span>
                </div>
              </section>

              {/* 1. HERO CARD */}
              <section className="relative rounded-[34px] sm:rounded-[38px] overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-[#19120E] aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[460px]">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=75"
                  alt="Le Goût des Rois - Grillades Khady"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25" />

                <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-between z-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E65100] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      L'EXCELLENCE À NIAMEY
                    </span>
                  </div>

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
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                        Cuisine fraîche, livraison et service traiteur à Niamey
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full max-w-full">
                      <a
                        href={RESTAURANT_INFO.whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all text-center"
                      >
                        <MessageSquare className="w-4 h-4 text-white flex-shrink-0" />
                        <span className="truncate">COMMANDER SUR WHATSAPP</span>
                      </a>
                      <button
                        onClick={() => navigateToMenuCategory('tous')}
                        className="inline-flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all text-center"
                      >
                        <span>VOIR LA CARTE</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-900 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. WHATSAPP PRE-ORDER & CATALOG CARD */}
              <section className="rounded-[28px] bg-gradient-to-r from-[#062419] via-[#092F20] to-[#051C13] border border-emerald-500/40 p-4 sm:p-5 shadow-xl transition-all w-full max-w-full min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
                  <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
                      <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                        📞 SERVICE TRAITEUR & REPAS
                      </span>
                      <h2 className="text-white font-black italic uppercase text-xs sm:text-base tracking-wide mt-1 leading-snug break-words">
                        PRÉCOMMANDE SUR LE NUMÉRO WHATSAPP DU RESTAURANT
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                        <span className="text-emerald-400 font-bold font-mono">
                          WhatsApp : {RESTAURANT_INFO.phone}
                        </span>
                        <span className="text-teal-300 font-medium">
                          • Commande & Devis direct
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 md:pt-0 w-full md:w-auto">
                    <a
                      href={RESTAURANT_INFO.whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 text-center"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Discuter avec le restaurant</span>
                    </a>

                    <a
                      href={RESTAURANT_INFO.whatsappCatalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-wider shadow transition-transform active:scale-95 text-center"
                    >
                      <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Catalogue WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              </section>

              {/* 3. VOICE ORDER & PUSH TRACKING CARDS */}
              <section className="grid grid-cols-2 gap-3 sm:gap-4">
                <div
                  onClick={() => setIsVoiceOpen(true)}
                  className="rounded-[28px] bg-gradient-to-br from-amber-600 via-orange-600 to-orange-700 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white">
                      <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider">
                      RECHERCHE VOCALE
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
                      ALERTES LIVRAISON EN DIRECT
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. FOUR WHITE SQUIRCLE SHORTCUTS */}
              <section className="grid grid-cols-4 gap-2 sm:gap-3">
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

              {/* 5. MOBILE MONEY BANNER */}
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
                      CONFIRMATION WHATSAPP & SUIVI EN LIGNE
                    </span>
                  </div>

                  <div className="text-amber-400 flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
              </section>

              {/* 5.5 SPECIAL SECTIONS: FLASH OFFERS, SIGNATURE DISHES & DÉJEUNER COMPLET */}
              <HomeSpecialSections
                items={items}
                onAddToCart={(item, qty, spice) => handleAddToCart(item, qty, spice || 'moyen')}
                onSelectItem={(item) => setSelectedItemForModal(item)}
                onNavigateToMenu={(cat) => navigateToMenuCategory(cat || 'tous')}
              />

              {/* 6. MENU DU JOUR (Dynamic from activePlatDuJour, controlled by isPlatDuJourVisible) */}
              {isPlatDuJourVisible && activePlatDuJour && (
                <section className="rounded-[32px] bg-gradient-to-b from-[#2B1B14] via-[#201511] to-[#17100D] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
                        ☀️ MENU DU JOUR
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#E2B124] text-stone-950 text-[11px] font-black uppercase tracking-wider shadow">
                        👑 SUGGESTION DU CHEF
                      </span>
                      <span className="px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-300 text-[11px] font-bold">
                        Cuisiné Frais à Niamey
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white font-display">
                        PLAT DU JOUR — {activePlatDuJour.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                        {activePlatDuJour.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full h-1 bg-orange-600 rounded-full mb-3" />
                    <div
                      onClick={() => setSelectedItemForModal(activePlatDuJour)}
                      className="rounded-[26px] bg-[#1F1714] border border-amber-500/30 p-3.5 sm:p-4 space-y-3 cursor-pointer hover:border-amber-400/50 transition-colors"
                    >
                      <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 w-full bg-stone-900">
                        <img
                          src={activePlatDuJour.image}
                          alt={activePlatDuJour.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#E65100] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                          🍲 PLAT CUISINÉ DU JOUR
                        </span>
                        <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 text-amber-300 text-xs font-bold backdrop-blur-sm border border-amber-500/30">
                          {activePlatDuJour.preparationTime || '20-30 min'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-black italic uppercase text-[#FFD700] font-display">
                          {activePlatDuJour.name}
                        </h3>
                        <p className="text-xs text-stone-300 leading-relaxed">
                          {activePlatDuJour.description}
                        </p>
                      </div>

                      {activePlatDuJour.ingredients && activePlatDuJour.ingredients.length > 0 && (
                        <div className="pt-1.5 pb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block mb-1">
                            ✨ Ingrédients & Accompagnements :
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activePlatDuJour.ingredients.map((ing, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-stone-900 border border-amber-500/20 text-stone-300 text-[10px] font-medium"
                              >
                                • {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-baseline gap-2">
                          <div className="text-base sm:text-lg font-black text-amber-400">
                            {activePlatDuJour.price.toLocaleString()} F CFA
                          </div>
                          {activePlatDuJour.oldPrice && (
                            <span className="text-xs text-stone-500 line-through">
                              {activePlatDuJour.oldPrice.toLocaleString()} F
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                              `Bonjour Khady's Food, je commande le Plat du Jour : ${activePlatDuJour.name} (${activePlatDuJour.price.toLocaleString()} FCFA) !`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                            title="Commander par WhatsApp direct"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleAddToCart(activePlatDuJour, 1, 'moyen')}
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
              )}

              {/* 7. LA CARTE DU RESTAURANT SECTION */}
              <section className="rounded-[32px] bg-[#1E1714] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="text-center space-y-3">
                  <h3 className="text-base sm:text-lg font-black italic uppercase tracking-wider text-[#FFD700] font-display">
                    LA CARTE DU RESTAURANT
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('traiteur')}
                      className="py-3 px-4 rounded-full bg-[#E2B124] hover:bg-[#F0BF2D] text-stone-950 font-black italic uppercase text-xs sm:text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      BUFFET PRO
                    </button>
                    <button
                      onClick={() => navigateToMenuCategory('sauces')}
                      className="py-3 px-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-black italic uppercase text-xs sm:text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      BOX SAUCES
                    </button>
                  </div>

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

              {/* 8. INCONTOURNABLES */}
              <section className="space-y-4 pt-2 w-full max-w-full min-w-0 overflow-hidden">
                <div className="relative overflow-hidden py-2 bg-gradient-to-r from-[#18110D] via-[#241711] to-[#18110D] border border-amber-500/30 rounded-2xl shadow-inner">
                  <div className="animate-marquee flex items-center gap-6 whitespace-nowrap text-xs font-bold text-stone-200">
                    {[
                      { icon: "🍲", name: "Tiep Rouge Royal au Poisson Capitaine" },
                      { icon: "🥩", name: "Dibi d'Agneau Grillé & Épices Kankankan" },
                      { icon: "🍗", name: "Poulet Braisé Yassa Oignons Confits" },
                      { icon: "🥟", name: "Pastels Farcis Croustillants Chauds" },
                      { icon: "🥗", name: "Attiéké Garba Poisson Braisé" },
                      { icon: "🥘", name: "Sauce Gombo Frais & Fufu Traditionnel" },
                      { icon: "🍹", name: "Jus de Bissap & Gingembre Frais Pressé" },
                      { icon: "🍲", name: "Tiep Blanc Capitaine Braisé" },
                      { icon: "🍲", name: "Tiep Rouge Royal au Poisson Capitaine" },
                      { icon: "🥩", name: "Dibi d'Agneau Grillé & Épices Kankankan" },
                      { icon: "🍗", name: "Poulet Braisé Yassa Oignons Confits" },
                      { icon: "🥟", name: "Pastels Farcis Croustillants Chauds" },
                      { icon: "🥗", name: "Attiéké Garba Poisson Braisé" },
                      { icon: "🥘", name: "Sauce Gombo Frais & Fufu Traditionnel" },
                      { icon: "🍹", name: "Jus de Bissap & Gingembre Frais Pressé" },
                      { icon: "🍲", name: "Tiep Blanc Capitaine Braisé" }
                    ].map((dish, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/80 border border-amber-500/20 hover:border-amber-400 transition-colors cursor-pointer select-none"
                        onClick={() => navigateToMenuCategory('tous')}
                      >
                        <span className="text-sm">{dish.icon}</span>
                        <span className="text-amber-200 font-extrabold uppercase text-[11px] tracking-wide">{dish.name}</span>
                        <span className="text-orange-400 text-[10px]">★</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Header with Heart Icon & TOUT VOIR */}
                <div className="flex items-center justify-between px-1 w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2A1D17] border border-orange-500/30 flex items-center justify-center flex-shrink-0 animate-pulse-subtle">
                      <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </div>
                    <h2 className="text-xs sm:text-base font-black italic uppercase tracking-wider text-[#B5A59E] font-display whitespace-nowrap">
                      INCONTOURNABLES
                    </h2>
                  </div>

                  <button
                    onClick={() => navigateToMenuCategory('tous')}
                    className="text-xs font-black italic uppercase text-[#E65100] hover:text-orange-400 transition-colors whitespace-nowrap"
                  >
                    TOUT VOIR
                  </button>
                </div>

                {/* Continuous Carousel */}
                <div
                  className="relative w-full overflow-hidden select-none py-1 group/scroller"
                  onMouseEnter={() => setIsAutoScrollPaused(true)}
                  onMouseLeave={() => setIsAutoScrollPaused(false)}
                  onTouchStart={() => setIsAutoScrollPaused(true)}
                  onTouchEnd={() => setIsAutoScrollPaused(false)}
                >
                  <div
                    className={`animate-continuous-dishes flex gap-4 ${
                      isAutoScrollPaused ? '[animation-play-state:paused]' : ''
                    }`}
                    style={{ willChange: 'transform' }}
                  >
                    {[...displayedIncontournables, ...displayedIncontournables].map((dish, idx) => {
                      const starsCount = Math.min(5, Math.max(1, Math.round(dish.rating ?? 5)));
                      return (
                        <div
                          key={`${dish.id}-${idx}`}
                          onClick={() => setSelectedItemForModal(dish)}
                          className="flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer rounded-[34px] sm:rounded-[38px] bg-[#C8C8CE] hover:bg-[#D5D5DC] p-3.5 shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className="relative h-48 sm:h-52 w-full rounded-[26px] sm:rounded-[28px] overflow-hidden bg-stone-300 shadow-inner">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=70";
                              }}
                            />
                            {dish.isPopular && (
                              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-[10px] uppercase shadow-md animate-pulse-subtle">
                                Populaire 🔥
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(dish, 1, 'moyen');
                              }}
                              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                              title="Ajouter au panier"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="pt-3 pb-1 space-y-2">
                            <h4 className="font-black italic uppercase text-stone-950 text-xs sm:text-sm tracking-wide truncate group-hover:text-orange-950 transition-colors">
                              {dish.name}
                            </h4>

                            <div className="flex items-center justify-between">
                              <span className="px-3.5 py-1 rounded-full bg-[#EAA688] text-[#802506] font-black text-xs shadow-sm transition-transform group-hover:scale-105">
                                {(dish.price || 0).toLocaleString()} F
                              </span>

                              <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                                {[...Array(5)].map((_, sIdx) => (
                                  <span key={sIdx} className={sIdx < starsCount ? 'text-amber-500' : 'text-stone-400'}>
                                    {sIdx < starsCount ? '★' : '☆'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 9. AVIS DES GOURMETS */}
              <GourmetReviewsSection
                reviews={reviews}
                onAddReview={handleSaveReview}
                items={items}
              />

            </div>
          )}

          {activeTab === 'carte' && (
            <MenuView
              items={items}
              onSelectItem={setSelectedItemForModal}
              onQuickAdd={(item) => handleAddToCart(item, 1, 'moyen')}
              initialCategory={menuFilterCategory}
            />
          )}

          {activeTab === 'traiteur' && <TraiteurView />}

          {activeTab === 'galerie' && <GalleryView />}

          {activeTab === 'suivi' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <OrderTracking
                order={activeOrder}
                onNewOrder={() => navigateToMenuCategory('tous')}
              />
            </div>
          )}
        </main>

        {/* FLOATING WHATSAPP BUTTON */}
        <a
          href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=Bonjour%20Khady%27s%20Food%20%26%20Event%2C%20je%20souhaite%20commander%20!`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 sm:bottom-24 right-3.5 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="WhatsApp direct Khady's Food"
        >
          <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
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

        {/* LIGHTWEIGHT MANAGER PIN GATE */}
        {isPinPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <form
              onSubmit={handleVerifyPin}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm bg-[#1B1512] border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl text-center"
            >
              <button
                type="button"
                onClick={() => setIsPinPromptOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase text-white">Accès Espace Gérant</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Saisissez votre code PIN gérant pour accéder à l'administration.
                </p>
              </div>

              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="Code PIN"
                className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-amber-500"
              />

              {pinError && (
                <p className="text-xs font-bold text-red-400">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg"
              >
                Déverrouiller la Console
              </button>
            </form>
          </div>
        )}

        {isAdminOpen && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center text-amber-400 font-bold text-sm">
                Chargement de la Console Admin...
              </div>
            }
          >
            <AdminDashboard
              items={items}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
              onToggleFeatured={handleToggleFeatured}
              onSetPlatDuJour={handleSetPlatDuJour}
              isPlatDuJourVisible={isPlatDuJourVisible}
              onTogglePlatDuJourVisible={handleTogglePlatDuJourVisible}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onClose={() => setIsAdminOpen(false)}
              reviews={reviews}
              onSaveReview={handleSaveReview}
              onDeleteReview={handleDeleteReview}
              onToggleVerifiedReview={handleToggleVerifiedReview}
            />
          </Suspense>
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
            requestAdminAccess();
          }}
          onOpenOrderTracking={(ord) => {
            setActiveOrder(ord);
            setIsProfileOpen(false);
            setActiveTab('suivi');
          }}
          onOpenContact={() => {
            setIsProfileOpen(false);
            setIsContactOpen(true);
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
            requestAdminAccess();
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      </div>
    </ErrorBoundary>
  );
};
export default App;
