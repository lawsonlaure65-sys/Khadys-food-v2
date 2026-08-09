import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import AdminDashboard from './components/AdminDashboard';
import MenuView from './components/MenuView';
import CartView from './components/CartView';
import AccountView from './components/AccountView';
import TraiteurView from './components/TraiteurView';
import GuideView from './components/GuideView';
import GalleryView from './components/GalleryView';
import VideoDemoView from './components/VideoDemoView';
import WhatsAppAutomationView from './components/WhatsAppAutomationView';
import BlogView, { INITIAL_BLOG_ARTICLES } from './components/BlogView';
import FaqView, { INITIAL_FAQS } from './components/FaqView';
import SettingsView from './components/SettingsView';
import ItemDetailsModal from './components/ItemDetailsModal';
import UpsellModal from './components/UpsellModal';
import OrderNotificationModal from './components/OrderNotificationModal';
import { VoiceOrderModal } from './components/VoiceOrderModal';
import { LiveDriverMapModal } from './components/LiveDriverMapModal';
import { SatisfactionSurveyModal } from './components/SatisfactionSurveyModal';
import { QrLoyaltyModal } from './components/QrLoyaltyModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import Receipt from './components/Receipt';
import Toast, { ToastType } from './components/Toast';
import DeliveryEstimator from './components/DeliveryEstimator';
import ReviewsSection from './components/ReviewsSection';
import PromotionCalendar from './components/PromotionCalendar';
import FlashOffer from './components/FlashOffer';
import { Page, MenuItem, Order, Review, CartItem, UserProfile, BlogArticle, FaqItem } from './types';
import { MENU_ITEMS, REVIEWS, LOGO_URL, POINTS_PER_1000 } from './constants';
import { playSound } from './utils/audio';
import { db, isSupabaseConfigured } from './lib/supabase';
import { ShoppingBag, User as UserIcon, Heart, Utensils, Star, Sparkles, Navigation, Image as ImageIcon, Video, MessageSquare, Moon, Sun, ShieldCheck, Zap, BookOpen, Settings, Bell, Mic, WifiOff, Database } from 'lucide-react';
import { 
  saveMenuToIDB, 
  getMenuFromIDB, 
  saveCartToIDB, 
  getCartFromIDB, 
  savePendingOrderToIDB, 
  getPendingOrdersFromIDB, 
  clearPendingOrdersFromIDB 
} from './utils/offlineDB';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  
  // Persistent items (menu dishes) initialization
  const [items, setItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('khadys_menu_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error reading khadys_menu_items from localStorage', e);
      }
    }
    return MENU_ITEMS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('khadys_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('khadys_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return REVIEWS;
  });

  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(() => {
    const saved = localStorage.getItem('khadys_blog_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_BLOG_ARTICLES;
  });

  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const saved = localStorage.getItem('khadys_faqs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_FAQS;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('khady_dark_mode') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Abdou R.',
    phone: '+227 90 00 00 00',
    points: 1250,
    rank: 'Gold',
    referralCode: 'KHADY-GOLD'
  });
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [notificationOrder, setNotificationOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [activeMenuSection, setActiveMenuSection] = useState('CARTE');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Modals for new feature requests
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showLiveDriverMapModal, setShowLiveDriverMapModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showQrLoyaltyModal, setShowQrLoyaltyModal] = useState(false);
  const [showPushNotificationModal, setShowPushNotificationModal] = useState(false);

  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetings = ["SALAM 👋🏾", "BONJOUR 👋🏾", "BARKA 👋🏾", "FOFO 👋🏾", "VOTRE FESTIN ? 🥘"];

  // Offline Mode & IndexedDB Initialization
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      setToast({ message: 'Connexion Internet rétablie ! Sync en cours...', type: 'success' });
      // Synchronisation des commandes enregistrées hors-ligne dans IndexedDB
      const pendingOrders = await getPendingOrdersFromIDB();
      if (pendingOrders.length > 0) {
        if (isSupabaseConfigured) {
          for (const ord of pendingOrders) {
            try {
              await db.placeOrder(ord);
            } catch {
              // Ignore errors
            }
          }
        }
        await clearPendingOrdersFromIDB();
        setToast({ message: `${pendingOrders.length} commande(s) hors-ligne synchronisée(s) !`, type: 'success' });
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setToast({ message: 'Mode Hors-ligne Actif — Consultation de la carte & panier disponibles (IndexedDB)', type: 'info' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Synchronisation IndexedDB & LocalStorage au démarrage
    const initOfflineStorage = async () => {
      // 1. Charger le panier sauvegardé en local dans IndexedDB
      const cachedCart = await getCartFromIDB();
      if (cachedCart && cachedCart.length > 0) {
        setCart(cachedCart);
      }

      // 2. Vérifier si IndexedDB possède un menu si LocalStorage n'était pas présent
      const hasLocalStorageMenu = Boolean(localStorage.getItem('khadys_menu_items'));
      if (!hasLocalStorageMenu) {
        const cachedMenu = await getMenuFromIDB();
        if (cachedMenu && cachedMenu.length > 0) {
          setItems(cachedMenu);
          localStorage.setItem('khadys_menu_items', JSON.stringify(cachedMenu));
        } else {
          await saveMenuToIDB(items);
        }
      }
    };

    initOfflineStorage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarde automatique du panier dans IndexedDB à chaque modification
  useEffect(() => {
    saveCartToIDB(cart);
  }, [cart]);

  // Sauvegarde automatique du menu dans LocalStorage & IndexedDB à chaque modification
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('khadys_menu_items', JSON.stringify(items));
      saveMenuToIDB(items);
    }
  }, [items]);

  // Sauvegarde automatique des commandes dans LocalStorage
  useEffect(() => {
    localStorage.setItem('khadys_orders', JSON.stringify(orders));
  }, [orders]);

  // Sauvegarde automatique des avis dans LocalStorage
  useEffect(() => {
    localStorage.setItem('khadys_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Sauvegarde automatique des articles du blog dans LocalStorage
  useEffect(() => {
    localStorage.setItem('khadys_blog_articles', JSON.stringify(blogArticles));
  }, [blogArticles]);

  // Sauvegarde automatique des FAQs dans LocalStorage
  useEffect(() => {
    localStorage.setItem('khadys_faqs', JSON.stringify(faqs));
  }, [faqs]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    playSound('pop');
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('khady_dark_mode', String(newMode));
  };

  // Chargement initial depuis Supabase
  useEffect(() => {
    const loadCloudData = async () => {
      if (isSupabaseConfigured) {
        try {
          const cloudMenu = await db.fetchMenu();
          if (cloudMenu && cloudMenu.length > 0) setItems(cloudMenu);
          
          const cloudOrders = await db.fetchOrders();
          if (cloudOrders && cloudOrders.length > 0) setOrders(cloudOrders);
        } catch {
          // Utilisation du mode local par défaut
        }
      }
    };
    loadCloudData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleAddToCart = (item: MenuItem, quantity: number, instructions: string) => {
    const cartItem: CartItem = { ...item, quantity, instructions };
    setCart(prev => [...prev, cartItem]);
    showToast(`${quantity}x ${item.name} ajouté !`);
    playSound('pop');
    
    if (item.category === 'Plat Africain' || item.category === 'Spécialité Maison') {
      setIsUpsellOpen(true);
    }
  };

  const handleOrderPlace = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setLastOrder(order);
    
    // Trigger Double / Triple Notification System (Visual, Audio, WhatsApp, In-App)
    setNotificationOrder(order);
    playSound('notification');
    setTimeout(() => playSound('cash'), 400);

    // Attribution des points : 100 points par 1000 F
    const pointsEarned = Math.floor(order.total / 1000) * POINTS_PER_1000;
    
    setUserProfile(prev => {
      const newPoints = prev.points + pointsEarned;
      let newRank = prev.rank;
      if (newPoints > 5000) newRank = 'Platinum';
      else if (newPoints > 2000) newRank = 'Gold';
      else newRank = 'Silver';

      return { ...prev, points: newPoints, rank: newRank };
    });

    setCurrentPage(Page.HOME);
    showToast(`🔔 Triple Notification transmise ! +${pointsEarned} points`, 'success');

    // Sauvegarde Cloud ou Hors-ligne IndexedDB
    if (!navigator.onLine) {
      await savePendingOrderToIDB(order);
      showToast(`📦 Commande enregistrée en mode Hors-Ligne (IndexedDB) ! Elle sera synchronisée à la reconnexion.`, 'info');
    } else if (isSupabaseConfigured) {
      try {
        await db.placeOrder(order);
      } catch (e) {
        console.error("Erreur sauvegarde commande:", e);
        await savePendingOrderToIDB(order);
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return (
          <div className="pb-40 animate-fade-in w-full max-w-2xl mx-auto">
            {/* Banner Mode Hors-ligne IndexedDB */}
            {isOffline && (
              <div className="bg-amber-500 text-brand-brown font-black px-4 py-2.5 text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-lg mb-2 rounded-2xl mx-4 animate-pulse border border-amber-600">
                <WifiOff size={14} className="shrink-0" />
                <span>Mode Hors-ligne Actif — Consultation Carte & Panier Disponibles (IndexedDB)</span>
                <Database size={14} className="shrink-0 ml-1 text-brand-brown/70" />
              </div>
            )}

            {/* Header Elite */}
            <header className={`sticky top-0 z-50 px-4 sm:px-6 py-5 flex justify-between items-center rounded-b-[2.5rem] shadow-lg mb-6 transition-all duration-300 ${
              isDarkMode ? 'bg-[#140C0A]/90 border-b border-brand-gold/20 backdrop-blur-xl text-white' : 'glass-card'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={LOGO_URL} alt="Logo" className="w-11 h-11 rounded-full border-2 border-brand-brown/10 shadow-md object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className={`text-[13px] font-black italic uppercase tracking-tighter leading-none ${isDarkMode ? 'text-brand-gold' : 'text-brand-brown'}`}>
                    Khady's
                  </h1>
                  <span className="text-[8px] font-black text-brand-orange uppercase tracking-[0.2em] leading-none mt-1">Food & Event</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Voice Order Quick Button */}
                <button 
                  onClick={() => { playSound('pop'); setShowVoiceModal(true); }}
                  className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform relative"
                  title="Commande Vocale 🎙️"
                >
                  <Mic size={18} className="animate-pulse" />
                </button>

                {/* Push Notification Button */}
                <button 
                  onClick={() => { playSound('pop'); setShowPushNotificationModal(true); }}
                  className="w-10 h-10 rounded-xl bg-brand-gold text-brand-brown flex items-center justify-center shadow-lg active:scale-90 transition-transform relative"
                  title="Notifications Push 🔔"
                >
                  <Bell size={18} className="animate-bounce" />
                </button>

                {/* Night Luxe Mode Toggle */}
                <button 
                  onClick={toggleDarkMode}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDarkMode ? 'bg-white/10 text-brand-gold' : 'bg-brand-brown/5 text-brand-brown hover:bg-brand-brown/10'
                  }`}
                  title="Thème Nuit Or"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button onClick={() => { playSound('pop'); setCurrentPage(Page.COMPTE); }} className="w-10 h-10 bg-brand-brown text-brand-gold rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                  <UserIcon size={18}/>
                </button>
              </div>
            </header>

            {/* Banner Hero */}
            <div className="px-4 sm:px-6 mb-8 overflow-hidden">
              <div className="relative h-60 rounded-[3rem] shadow-2xl overflow-hidden group cursor-pointer border-2 border-brand-gold/20" onClick={() => setCurrentPage(Page.MENU)}>
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
                <img 
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000" 
                  className="absolute inset-0 w-full h-full object-cover animate-zoom-dezoom" 
                  alt="Banner" 
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-brand-gold animate-pulse" />
                    <span className="bg-brand-orange text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow-lg">L'Excellence à Niamey</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-4">
                    LE GÔUT <br/><span className="text-brand-gold">DES ROIS</span>
                  </h2>
                  <button className="bg-white text-brand-brown px-6 py-2.5 rounded-full text-[9px] font-black uppercase italic self-start shadow-xl flex items-center gap-2 group-hover:bg-brand-gold transition-colors">
                    Commander maintenant <Navigation size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Dual Banners: Commande Vocale & Notifications Push */}
            <div className="px-4 sm:px-6 grid grid-cols-2 gap-3 mb-6">
              <div 
                onClick={() => { playSound('pop'); setShowVoiceModal(true); }}
                className="bg-gradient-to-br from-brand-orange to-brand-brown text-white p-5 rounded-[2.2rem] shadow-xl border-2 border-brand-orange/40 flex flex-col justify-between cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
              >
                <div className="absolute -right-4 -bottom-4 opacity-15 text-white">
                  <Mic size={70} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Mic size={16} className="animate-pulse" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest">IA Vocale</span>
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase italic text-white leading-tight">Commande Vocale 🎙️</h3>
                  <p className="text-[8px] font-bold text-white/70 uppercase mt-0.5">Dictez votre repas au micro</p>
                </div>
              </div>

              <div 
                onClick={() => { playSound('pop'); setShowPushNotificationModal(true); }}
                className="bg-gradient-to-br from-brand-brown to-[#1A0F0D] text-white p-5 rounded-[2.2rem] shadow-xl border-2 border-brand-gold/40 flex flex-col justify-between cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
              >
                <div className="absolute -right-4 -bottom-4 opacity-15 text-brand-gold">
                  <Bell size={70} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0 shadow-md border border-brand-gold/30">
                    <Bell size={16} className="animate-bounce" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest">Suivi PWA</span>
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase italic text-brand-gold leading-tight">Notifications Push 🔔</h3>
                  <p className="text-[8px] font-bold text-white/70 uppercase mt-0.5">Alertes livraison en temps réel</p>
                </div>
              </div>
            </div>

            {/* High Tech Banners & Shortcuts Grid */}
            <div className="px-4 sm:px-6 grid grid-cols-4 gap-2 sm:gap-3 mb-8">
              <button 
                onClick={() => { playSound('pop'); setCurrentPage(Page.WHATSAPP); }}
                className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-green-500"
              >
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mb-1 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[9px] font-black text-brand-brown uppercase italic leading-tight">WhatsApp</span>
                <span className="text-[7px] text-gray-400 uppercase font-bold mt-0.5">Commande Directe</span>
              </button>

              <button 
                onClick={() => { playSound('pop'); setCurrentPage(Page.GALLERY); }}
                className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-brand-gold"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-1 group-hover:bg-brand-gold group-hover:text-brand-brown transition-colors">
                  <ImageIcon size={18} />
                </div>
                <span className="text-[9px] font-black text-brand-brown uppercase italic leading-tight">Galerie</span>
                <span className="text-[7px] text-gray-400 uppercase font-bold mt-0.5">Photos Plats</span>
              </button>

              <button 
                onClick={() => { playSound('pop'); setCurrentPage(Page.BLOG); }}
                className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-brand-brown"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-brown/10 text-brand-brown flex items-center justify-center mb-1 group-hover:bg-brand-brown group-hover:text-brand-gold transition-colors">
                  <BookOpen size={18} />
                </div>
                <span className="text-[9px] font-black text-brand-brown uppercase italic leading-tight">Blog</span>
                <span className="text-[7px] text-gray-400 uppercase font-bold mt-0.5">Recettes & Astuces</span>
              </button>

              <button 
                onClick={() => { playSound('pop'); setCurrentPage(Page.SETTINGS); }}
                className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-100 text-brand-brown flex items-center justify-center mb-1 shadow-md">
                  <Settings size={18} />
                </div>
                <span className="text-[9px] font-black text-brand-brown uppercase italic leading-tight">Contact</span>
                <span className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">FAQ & Infos</span>
              </button>
            </div>

            {/* Mobile Money Guarantee Highlight Banner */}
            <div className="px-4 sm:px-6 mb-8">
              <div 
                onClick={() => setCurrentPage(Page.CART)}
                className="bg-gradient-to-r from-[#1A0F0D] to-[#2C1814] text-white p-6 rounded-[2.5rem] shadow-xl border-2 border-brand-gold/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-gold/20 text-brand-gold rounded-2xl flex items-center justify-center shrink-0 border border-brand-gold/40">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest block">Paiement Sécurisé Mobile Money</span>
                    <h3 className="font-black text-xs uppercase italic text-white mt-0.5">
                      Zamany Money (Orange), MyNita, Amanata, All-Iza, Zeynab, Airtel, Moov
                    </h3>
                    <p className="text-[8px] font-bold text-white/60 uppercase mt-1">Double Notification WhatsApp & In-App</p>
                  </div>
                </div>
                <Zap size={20} className="text-brand-gold shrink-0 animate-pulse" />
              </div>
            </div>

            {/* Interactive Flash Offer Component with Dynamic Countdown */}
            <div className="px-4 sm:px-6">
              <FlashOffer 
                onAddToCart={handleAddToCart}
                onSelectItem={(item) => {
                  setSelectedItem(item);
                  setIsItemModalOpen(true);
                  playSound('pop');
                }}
              />
            </div>

            {/* Interactive Weekly Promotion Calendar Component */}
            <div className="px-4 sm:px-6">
              <PromotionCalendar 
                onSelectOffer={(promo) => {
                  setToast({ 
                    message: `🎉 Offre ${promo.dayName} activée ! Code : ${promo.code}`, 
                    type: 'success' 
                  });
                }}
                onGoToMenu={() => {
                  setActiveMenuSection('CARTE');
                  setCurrentPage(Page.MENU);
                }}
              />
            </div>

            {/* Menu Grid */}
            <div className="px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-5 gap-3 mb-12">
              <div className="sm:col-span-3 bg-[#1A0F0D] rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group active:scale-95 transition-all cursor-pointer border border-white/5 h-48 sm:h-auto" onClick={() => { setActiveMenuSection('CARTE'); setCurrentPage(Page.MENU); }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-3 relative z-10 border border-white/10"><Utensils size={32}/></div>
                <span className="text-[11px] font-black uppercase text-brand-gold tracking-[0.4em] italic relative z-10">LA CARTE DU RESTAURANT</span>
              </div>
              <div className="sm:col-span-2 flex flex-row sm:flex-col gap-3">
                <button onClick={() => { setActiveMenuSection('PACK'); setCurrentPage(Page.MENU); }} className="flex-1 bg-brand-gold text-brand-brown py-5 rounded-[1.8rem] font-black uppercase text-[9px] italic flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all border border-white/20">
                   BUFFET PRO
                </button>
                <button onClick={() => { setActiveMenuSection('BOX'); setCurrentPage(Page.MENU); }} className="flex-1 bg-brand-orange text-white py-5 rounded-[1.8rem] font-black uppercase text-[9px] italic flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all border border-white/20">
                   BOX SAUCES
                </button>
              </div>
              <button onClick={() => setCurrentPage(Page.TRAITEUR)} className="sm:col-span-5 w-full bg-white text-brand-brown py-5 rounded-[1.8rem] font-black uppercase text-[9px] italic border border-gray-100 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                   EVENT & DEVIS TRAITEUR
              </button>
            </div>

            {/* Incontournables */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8 px-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange"><Heart size={18} fill="currentColor" /></div>
                  <h3 className="text-sm font-black uppercase text-brand-brown tracking-[0.2em] italic">Incontournables</h3>
                </div>
                <button onClick={() => setCurrentPage(Page.MENU)} className="text-[9px] font-black text-brand-orange uppercase tracking-widest underline">Tout voir</button>
              </div>
              
              <div className="relative overflow-hidden w-full">
                <div className="flex animate-infinite-scroll w-fit gap-6 sm:gap-8 px-6 flex-nowrap py-4">
                  {[...items.slice(0, 10), ...items.slice(0, 10)].map((item, i) => (
                    <div key={i} className="w-56 sm:w-60 flex-shrink-0 glass-card rounded-[3rem] p-5 shadow-2xl border border-white/20 flex flex-col cursor-pointer active:scale-95 transition-all group" onClick={() => { setSelectedItem(item); setIsItemModalOpen(true); playSound('pop'); }}>
                      <div className="w-full h-40 overflow-hidden rounded-[2.2rem] mb-5 shadow-inner bg-gray-100">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-115" alt={item.name} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase text-brand-brown italic mb-3 truncate">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-brand-orange px-4 py-1.5 bg-brand-orange/10 rounded-full">{item.price} F</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < 4 ? "#FFD700" : "none"} className="text-brand-gold" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="px-4 sm:px-6 mb-12">
              <DeliveryEstimator />
            </div>

            <div className="px-4 sm:px-6">
              <ReviewsSection reviews={reviews} />
            </div>
          </div>
        );

      case Page.MENU:
        return <div className="max-w-4xl mx-auto"><MenuView items={items} onSelectItem={(item) => { setSelectedItem(item); setIsItemModalOpen(true); }} activeSection={activeMenuSection} onSectionChange={setActiveMenuSection} onOpenVoiceModal={() => setShowVoiceModal(true)} /></div>;

      case Page.BLOG:
        return (
          <div className="max-w-4xl mx-auto">
            <BlogView 
              articles={blogArticles} 
              onNavigateToMenu={() => setCurrentPage(Page.MENU)} 
            />
          </div>
        );

      case Page.FAQ:
        return (
          <div className="max-w-2xl mx-auto">
            <FaqView 
              faqs={faqs} 
              onNavigateToWhatsApp={() => setCurrentPage(Page.WHATSAPP)} 
            />
          </div>
        );

      case Page.SETTINGS:
        return (
          <div className="max-w-2xl mx-auto">
            <SettingsView 
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenAdmin={() => setCurrentPage(Page.ADMIN)}
              onOpenFaq={() => setCurrentPage(Page.FAQ)}
              onOpenGuide={() => setCurrentPage(Page.INFOS)}
              onOpenWhatsApp={() => setCurrentPage(Page.WHATSAPP)}
            />
          </div>
        );

      case Page.GALLERY:
        return <div className="max-w-4xl mx-auto"><GalleryView items={items} onAddToCart={handleAddToCart} onNavigateToMenu={() => setCurrentPage(Page.MENU)} /></div>;

      case Page.VIDEO:
        return <div className="max-w-4xl mx-auto"><VideoDemoView onNavigateToMenu={() => setCurrentPage(Page.MENU)} onNavigateToTraiteur={() => setCurrentPage(Page.TRAITEUR)} /></div>;

      case Page.WHATSAPP:
        return <div className="max-w-4xl mx-auto"><WhatsAppAutomationView cart={cart} userProfile={userProfile} onNavigateToCart={() => setCurrentPage(Page.CART)} onNavigateToMenu={() => setCurrentPage(Page.MENU)} /></div>;

      case Page.TRAITEUR:
        return <div className="max-w-2xl mx-auto"><TraiteurView /></div>;

      case Page.INFOS:
        return <div className="max-w-2xl mx-auto"><GuideView onClose={() => setCurrentPage(Page.HOME)} /></div>;

      case Page.CART:
        return <div className="max-w-2xl mx-auto">
          <CartView 
            cart={cart} 
            setCart={setCart} 
            onOrderPlace={handleOrderPlace} 
            onClose={() => setCurrentPage(Page.MENU)} 
            userProfile={userProfile}
            onConsumePoints={(pts) => setUserProfile(prev => ({ ...prev, points: Math.max(0, prev.points - pts) }))}
          />
        </div>;

      case Page.COMPTE:
        return <div className="max-w-xl mx-auto">
          <AccountView 
            orders={orders} 
            userProfile={userProfile}
            onAdminAccess={() => setCurrentPage(Page.ADMIN)} 
            onLoginSuccess={(isAdmin, customProfile) => {
              if (isAdmin) {
                setToast({ message: "Session Administrateur Ouverte ! Bienvenue dans la Console Elite 👑", type: 'success' });
                setCurrentPage(Page.ADMIN);
              } else {
                if (customProfile) {
                  setUserProfile(customProfile);
                }
                setCurrentPage(Page.COMPTE);
              }
            }} 
            onOpenGuide={() => setCurrentPage(Page.INFOS)} 
            onOpenQrLoyalty={() => setShowQrLoyaltyModal(true)}
            onOpenLiveDriverMap={() => setShowLiveDriverMapModal(true)}
            onOpenSurvey={() => setShowSurveyModal(true)}
            onOpenPushNotification={() => setShowPushNotificationModal(true)}
          />
        </div>;

      case Page.ADMIN:
        return (
          <div className="w-full min-h-screen">
            <AdminDashboard 
              items={items} 
              setItems={setItems} 
              orders={orders} 
              setOrders={setOrders} 
              reviews={reviews} 
              setReviews={setReviews} 
              blogArticles={blogArticles}
              setBlogArticles={setBlogArticles}
              faqs={faqs}
              setFaqs={setFaqs}
              onExit={() => {
                setToast({ message: "Retour à l'espace Client", type: 'info' });
                setCurrentPage(Page.COMPTE);
              }} 
            />
          </div>
        );

      default:
        return <div className="max-w-4xl mx-auto"><MenuView items={items} onSelectItem={(item) => { setSelectedItem(item); setIsItemModalOpen(true); }} activeSection={activeMenuSection} onSectionChange={setActiveMenuSection} /></div>;
    }
  };

  const upsellSuggestions = useMemo(() => {
    return items.filter(i => i.category === 'Boisson Froide' || i.category === 'Dessert').slice(0, 4);
  }, [items]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-brand-orange selection:text-white pb-safe flex flex-col items-center ${
      isDarkMode ? 'bg-[#0E0806] text-white' : 'bg-[#FDFCFB] text-brand-brown'
    }`}>
      <div className="w-full h-full flex flex-col items-center">
        {renderPage()}
      </div>
      
      {currentPage !== Page.ADMIN && (
        <>
          <Navbar currentPage={currentPage} setPage={setCurrentPage} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} />
          <AIChat />
        </>
      )}

      <ItemDetailsModal 
        item={selectedItem} 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)} 
        onAddToCart={handleAddToCart} 
      />

      <UpsellModal 
        isOpen={isUpsellOpen} 
        onClose={() => setIsUpsellOpen(false)} 
        suggestions={upsellSuggestions}
        onAdd={(item) => { handleAddToCart(item, 1, ''); setIsUpsellOpen(false); }}
        onProceed={() => { setIsUpsellOpen(false); setCurrentPage(Page.CART); }}
      />

      {/* Triple / Double Notification Modal */}
      {notificationOrder && (
        <OrderNotificationModal 
          order={notificationOrder} 
          onClose={() => setNotificationOrder(null)} 
          onTrackOrder={() => setCurrentPage(Page.COMPTE)}
        />
      )}

      {lastOrder && !notificationOrder && (
        <Receipt order={lastOrder} onClose={() => setLastOrder(null)} />
      )}

      {/* Feature Modals */}
      <VoiceOrderModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        menuItems={items}
        onAddToCart={(item, qty) => {
          handleAddToCart(item, qty, '');
          setToast({ message: `${qty}x ${item.name} ajouté via Commande Vocale ! 🎙️`, type: 'success' });
        }}
      />

      <LiveDriverMapModal
        isOpen={showLiveDriverMapModal}
        onClose={() => setShowLiveDriverMapModal(false)}
        order={orders.length > 0 ? orders[0] : (lastOrder || {
          id: 'KH-2026-LIVE',
          customerName: userProfile.name,
          phone: userProfile.phone,
          address: 'Avenue de la Francophonie',
          district: 'Plateau / Niamey',
          items: cart,
          total: 12500,
          deliveryFee: 1000,
          status: 'DELIVERING',
          paymentMethod: 'ZAMANY',
          timestamp: new Date().toISOString()
        })}
      />

      <SatisfactionSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onCompleteSurvey={(pts) => {
          setUserProfile(prev => ({ ...prev, points: prev.points + pts }));
          setToast({ message: `Avis enregistré ! +${pts} Points Fidélité crédités ! ⭐️`, type: 'success' });
        }}
      />

      <QrLoyaltyModal
        isOpen={showQrLoyaltyModal}
        onClose={() => setShowQrLoyaltyModal(false)}
        userProfile={userProfile}
        onAddPoints={(pts) => {
          setUserProfile(prev => ({ ...prev, points: prev.points + pts }));
          setToast({ message: `QR Code scanné avec succès ! +${pts} Points Crédités ! 👑`, type: 'success' });
        }}
      />

      <PushNotificationManager
        isOpen={showPushNotificationModal}
        onClose={() => setShowPushNotificationModal(false)}
        onShowToast={(msg, type) => setToast({ message: msg, type: type as ToastType })}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default App;
