import React, { useState, useRef, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, Cell 
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, Utensils, X, TrendingUp, Star, 
  Settings, Bike, Sparkles, Zap, Plus, Trash2, 
  Edit3, Power, RefreshCw, Users, Package, 
  Calendar, Smartphone, CheckCircle2, ChefHat, PackageCheck, Bell, Camera, 
  MapPin, Clock, Heart, Sliders, DollarSign, MessageCircle, AlertCircle,
  UserRound, Save, ToggleLeft as Toggle, Image as ImageIcon, BookOpen, HelpCircle,
  ShieldAlert, AlertTriangle, BarChart3, LineChart as LineChartIcon, ArrowUpRight, Database,
  Sun, Moon, Gift, Share2, ToggleLeft, ToggleRight, ArrowRight
} from 'lucide-react';
import { MenuItem, AdminView, Order, Review, MenuCategory, OrderStatus, BlogArticle, FaqItem } from '../types';
import { KhadyLogo } from './KhadyLogo';
import { playSound } from '../utils/audio';
import { GoogleGenAI } from "@google/genai";
import { DISTRICTS, BILLO_INFO, MENU_ITEMS } from '../constants';
import { db, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../utils/imageCompressor';
import { AdminMarketingCenter } from './AdminMarketingCenter';
import { getStoredPlatDuJour, saveStoredPlatDuJour, PlatDuJourConfig } from '../utils/marketing';

interface AdminDashboardProps {
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  blogArticles: BlogArticle[];
  setBlogArticles: React.Dispatch<React.SetStateAction<BlogArticle[]>>;
  faqs: FaqItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  onExit: () => void;
}

interface DeleteTarget {
  type: 'dish' | 'article' | 'faq' | 'media';
  id: string;
  name: string;
  category?: string;
  image?: string;
  onConfirm: () => void;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1C0F0D]/95 border border-brand-gold/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md text-white space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 mb-1">
          <span className="font-black text-brand-gold uppercase text-[10px] tracking-wider">
            Mois de {label} 2026
          </span>
          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Validé
          </span>
        </div>
        <div className="flex justify-between gap-6 font-black text-xs">
          <span className="text-white/60">Revenus Validés :</span>
          <span className="text-brand-orange">{data.revenue.toLocaleString('fr-FR')} F CFA</span>
        </div>
        <div className="flex justify-between gap-6 font-bold text-[10px]">
          <span className="text-white/60">Commandes Livrées :</span>
          <span className="text-emerald-400">{data.ordersCount} commandes</span>
        </div>
        <div className="flex justify-between gap-6 font-bold text-[9px] pt-1.5 text-white/40 border-t border-white/5">
          <span>Panier Moyen :</span>
          <span>{data.ordersCount > 0 ? Math.round(data.revenue / data.ordersCount).toLocaleString('fr-FR') : 0} F CFA</span>
        </div>
      </div>
    );
  }
  return null;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  items, setItems, onExit, setOrders, orders, reviews, setReviews,
  blogArticles, setBlogArticles, faqs, setFaqs
}) => {
  const [currentView, setCurrentView] = useState<AdminView>(AdminView.DASHBOARD);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<BlogArticle> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<DeleteTarget | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState('');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const adminPhotoInputRef = useRef<HTMLInputElement>(null);
  const dishPhotoInputRef = useRef<HTMLInputElement>(null);
  const articlePhotoInputRef = useRef<HTMLInputElement>(null);
  const [adminAvatar, setAdminAvatar] = useState(() => localStorage.getItem('khadys_admin_avatar') || '');
  const [platDuJour, setPlatDuJour] = useState<PlatDuJourConfig>(() => getStoredPlatDuJour());

  // Listen to real-time Plat du Jour updates across admin and app
  React.useEffect(() => {
    const handlePlatChange = (e: any) => {
      if (e?.detail) {
        setPlatDuJour(e.detail);
      } else {
        setPlatDuJour(getStoredPlatDuJour());
      }
    };
    window.addEventListener('khadys_plat_du_jour_updated', handlePlatChange);
    window.addEventListener('storage', handlePlatChange);
    return () => {
      window.removeEventListener('khadys_plat_du_jour_updated', handlePlatChange);
      window.removeEventListener('storage', handlePlatChange);
    };
  }, []);

  const handleTogglePlatDuJour = () => {
    playSound('pop');
    const updated = { ...platDuJour, isActive: !platDuJour.isActive };
    setPlatDuJour(updated);
    saveStoredPlatDuJour(updated);
  };

  // Dynamic monthly sales data calculation based on validated orders
  const monthlySalesData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    
    // Baseline simulation data up to August 2026
    const baseRevenue = [1450000, 1820000, 2100000, 1950000, 2400000, 2750000, 3100000, 3450000, 0, 0, 0, 0];
    const baseOrders = [142, 168, 195, 180, 210, 245, 280, 315, 0, 0, 0, 0];

    const data = months.map((m, idx) => ({
      month: m,
      revenue: baseRevenue[idx],
      ordersCount: baseOrders[idx],
      formattedRevenue: `${(baseRevenue[idx] / 1000).toLocaleString('fr-FR')}k F`,
    }));

    // Accumulate non-cancelled orders into appropriate months
    orders.forEach(order => {
      if (order.status !== 'CANCELLED') {
        const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
        const monthIdx = isNaN(orderDate.getTime()) ? 7 : orderDate.getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          data[monthIdx].revenue += order.total || 0;
          data[monthIdx].ordersCount += 1;
          data[monthIdx].formattedRevenue = `${(data[monthIdx].revenue / 1000).toLocaleString('fr-FR')}k F`;
        }
      }
    });

    return data;
  }, [orders]);

  const salesStats = useMemo(() => {
    const totalRevenue = monthlySalesData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalValidatedOrders = monthlySalesData.reduce((acc, curr) => acc + curr.ordersCount, 0);
    const peakMonthObj = [...monthlySalesData].sort((a, b) => b.revenue - a.revenue)[0];
    const avgBasket = totalValidatedOrders > 0 ? Math.round(totalRevenue / totalValidatedOrders) : 0;

    return {
      totalRevenue,
      totalValidatedOrders,
      peakMonth: peakMonthObj?.month || 'Août',
      peakRevenue: peakMonthObj?.revenue || 0,
      avgBasket
    };
  }, [monthlySalesData]);

  const handleAdminPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressed = await compressImage(base64String, 500, 0.7);
        setAdminAvatar(compressed);
        try {
          localStorage.setItem('khadys_admin_avatar', compressed);
        } catch (e) {}
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDishPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressed = await compressImage(base64String, 800, 0.75);
        setEditingItem(prev => prev ? { ...prev, image: compressed } : null);
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArticlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressed = await compressImage(base64String, 800, 0.75);
        setEditingArticle(prev => prev ? { ...prev, image: compressed } : null);
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.price) return;

    let finalImage = editingItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    if (finalImage.startsWith('data:image') && finalImage.length > 100000) {
      finalImage = await compressImage(finalImage, 800, 0.75);
    }

    const finalItem = {
      ...editingItem,
      id: editingItem.id || `item-${Date.now()}`,
      rating: editingItem.rating || 5,
      isAvailable: editingItem.isAvailable ?? true,
      category: editingItem.category || 'Plat Africain',
      image: finalImage
    } as MenuItem;

    setItems(prev => {
      const exists = prev.some(i => i.id === finalItem.id);
      return exists ? prev.map(i => i.id === finalItem.id ? finalItem : i) : [finalItem, ...prev];
    });

    if (isSupabaseConfigured) {
      db.saveMenuItem(finalItem).then(res => {
        if (!res.success) {
          console.warn('⚠️ Supabase Cloud Save Issue:', res.error);
        }
      });
    }
    
    setEditingItem(null);
    playSound('success');
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.content) return;

    const finalArt: BlogArticle = {
      id: editingArticle.id || `blog-${Date.now()}`,
      title: editingArticle.title,
      summary: editingArticle.summary || editingArticle.content.substring(0, 100),
      content: editingArticle.content,
      author: editingArticle.author || 'Chef Khady',
      date: editingArticle.date || 'Aujourd\'hui',
      readTime: editingArticle.readTime || '3 min',
      image: editingArticle.image || 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f',
      category: (editingArticle.category as any) || 'Secrets du Chef',
      likes: editingArticle.likes || 120
    };

    if (blogArticles.find(a => a.id === finalArt.id)) {
      setBlogArticles(prev => prev.map(a => a.id === finalArt.id ? finalArt : a));
    } else {
      setBlogArticles(prev => [finalArt, ...prev]);
    }

    setEditingArticle(null);
    playSound('success');
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question || !editingFaq?.answer) return;

    const finalFaq: FaqItem = {
      id: editingFaq.id || `faq-${Date.now()}`,
      question: editingFaq.question,
      answer: editingFaq.answer,
      category: (editingFaq.category as any) || 'Paiement'
    };

    if (faqs.find(f => f.id === finalFaq.id)) {
      setFaqs(prev => prev.map(f => f.id === finalFaq.id ? finalFaq : f));
    } else {
      setFaqs(prev => [finalFaq, ...prev]);
    }

    setEditingFaq(null);
    playSound('success');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    playSound('notification');
  };

  const runAiStrategy = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Génère une stratégie marketing éclair pour booster les ventes de Tiep, Box Sauces et Buffets à Niamey. 2 lignes maximum.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiStrategy(response.text || "");
      playSound('success');
    } catch (e) {
      setAiStrategy("Veuillez configurer votre clé API pour l'IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case AdminView.DASHBOARD:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* PLAT DU JOUR LIVE CONTROL HERO CARD */}
            <div className="bg-gradient-to-r from-amber-950/70 via-[#2E140D] to-[#1A0A06] p-5 sm:p-7 rounded-[2.5rem] border-2 border-brand-gold/40 shadow-2xl relative overflow-hidden">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Dish Preview */}
                  <div className="flex items-center gap-4 sm:gap-5">
                     <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-brand-gold/40 shadow-xl bg-black/40">
                        <img 
                          src={platDuJour.dishImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000'} 
                          alt={platDuJour.dishName} 
                          className="w-full h-full object-cover" 
                        />
                        <div className={`absolute top-1 left-1 text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow ${
                          platDuJour.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {platDuJour.isActive ? 'En Ligne' : 'Masqué'}
                        </div>
                     </div>

                     <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                           <span className="bg-brand-gold/20 text-brand-gold text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border border-brand-gold/30 flex items-center gap-1">
                              <Sun size={10} className="text-brand-orange" /> Plat du Jour Actuel
                           </span>
                           <span className="text-[8px] font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                              {platDuJour.targetDayLabel || (platDuJour.publicationTiming === 'TONIGHT_FOR_TOMORROW' ? 'Demain Midi' : "Aujourd'hui")}
                           </span>
                        </div>
                        <h4 className="text-base sm:text-xl font-black italic uppercase text-white leading-tight">
                           {platDuJour.dishName}
                        </h4>
                        <div className="flex items-center gap-2.5 text-xs">
                           <span className="text-brand-orange font-black font-mono">
                              {(platDuJour.promoPrice || platDuJour.price).toLocaleString('fr-FR')} F CFA
                           </span>
                           {platDuJour.promoPrice && platDuJour.promoPrice < platDuJour.price && (
                              <span className="text-white/40 line-through text-[10px] font-mono">
                                 {platDuJour.price.toLocaleString('fr-FR')} F
                              </span>
                           )}
                           <span className="text-white/50 text-[10px]">
                              • {platDuJour.remainingStock || 25} parts
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                     <button
                        type="button"
                        onClick={handleTogglePlatDuJour}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                           platDuJour.isActive
                              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
                              : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                        }`}
                     >
                        {platDuJour.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                        <span>{platDuJour.isActive ? 'Visible sur l\'App' : 'Activer sur l\'App'}</span>
                     </button>

                     <button
                        type="button"
                        onClick={() => {
                           playSound('pop');
                           setCurrentView(AdminView.PLAT_DU_JOUR);
                        }}
                        className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-orange/30 active:scale-95 transition-all flex items-center gap-1.5"
                     >
                        <Utensils size={14} />
                        <span>Changer / Créer</span>
                     </button>

                     <button
                        type="button"
                        onClick={() => {
                           playSound('pop');
                           setCurrentView(AdminView.PLAT_DU_JOUR);
                        }}
                        className="bg-brand-gold hover:bg-yellow-400 text-brand-brown px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                     >
                        <Sparkles size={14} />
                        <span>Studio Affiche</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Ventes du Mois', val: `${(salesStats.peakRevenue / 1000).toLocaleString('fr-FR')}k F`, icon: DollarSign, col: 'text-brand-gold' },
                 { label: 'Commandes Validées', val: salesStats.totalValidatedOrders, icon: ShoppingBag, col: 'text-brand-orange' },
                 { label: 'Livreurs Live', val: '4 Actifs', icon: Bike, col: 'text-green-400' },
                 { label: 'Articles Blog', val: blogArticles.length, icon: BookOpen, col: 'text-yellow-400' }
               ].map((s, i) => (
                 <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                    <s.icon size={20} className={`${s.col} mb-3`} />
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">{s.label}</p>
                    <h4 className="text-xl font-black italic">{s.val}</h4>
                 </div>
               ))}
            </div>

            {/* Interactive Monthly Sales Chart powered by Recharts */}
            <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="p-2.5 bg-brand-gold/20 text-brand-gold rounded-2xl border border-brand-gold/30">
                           <TrendingUp size={20} />
                        </span>
                        <div>
                           <h3 className="text-lg md:text-xl font-black italic uppercase text-brand-gold tracking-wide">
                              Graphique des Ventes Mensuelles
                           </h3>
                           <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                              Visualisation des revenus générés par les commandes validées ({salesStats.totalValidatedOrders} commandes)
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Chart Metric & Type Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                     <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-[10px] font-bold">
                        <button 
                          onClick={() => { playSound('pop'); setChartMetric('revenue'); }}
                          className={`px-3 py-1.5 rounded-xl uppercase transition-all ${chartMetric === 'revenue' ? 'bg-brand-orange text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                        >
                           Revenu (F CFA)
                        </button>
                        <button 
                          onClick={() => { playSound('pop'); setChartMetric('orders'); }}
                          className={`px-3 py-1.5 rounded-xl uppercase transition-all ${chartMetric === 'orders' ? 'bg-brand-orange text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                        >
                           Commandes
                        </button>
                     </div>

                     <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-[10px] font-bold">
                        <button 
                          onClick={() => { playSound('pop'); setChartType('area'); }}
                          className={`p-2 rounded-xl transition-all ${chartType === 'area' ? 'bg-brand-gold text-brand-brown shadow-md' : 'text-white/50 hover:text-white'}`}
                          title="Graphique en Courbe"
                        >
                           <LineChartIcon size={16} />
                        </button>
                        <button 
                          onClick={() => { playSound('pop'); setChartType('bar'); }}
                          className={`p-2 rounded-xl transition-all ${chartType === 'bar' ? 'bg-brand-gold text-brand-brown shadow-md' : 'text-white/50 hover:text-white'}`}
                          title="Graphique en Barres"
                        >
                           <BarChart3 size={16} />
                        </button>
                     </div>
                  </div>
               </div>

               {/* KPI Summary Cards */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-brand-gold/30 transition-all">
                     <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Revenu Total 2026</p>
                     <h4 className="text-base md:text-lg font-black text-brand-gold italic mt-0.5">
                        {salesStats.totalRevenue.toLocaleString('fr-FR')} F
                     </h4>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                     <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Commandes Validées</p>
                     <h4 className="text-base md:text-lg font-black text-emerald-400 italic mt-0.5">
                        {salesStats.totalValidatedOrders}
                     </h4>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-all">
                     <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Mois de Peak</p>
                     <h4 className="text-base md:text-lg font-black text-brand-orange italic mt-0.5">
                        {salesStats.peakMonth} ({salesStats.peakRevenue.toLocaleString('fr-FR')} F)
                     </h4>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                     <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Panier Moyen Validé</p>
                     <h4 className="text-base md:text-lg font-black text-purple-300 italic mt-0.5">
                        {salesStats.avgBasket.toLocaleString('fr-FR')} F
                     </h4>
                  </div>
               </div>

               {/* Recharts Container */}
               <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                     {chartType === 'area' ? (
                        <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                                 <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.05}/>
                              </linearGradient>
                              <linearGradient id="colorOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                 <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                           <XAxis 
                             dataKey="month" 
                             stroke="#ffffff40" 
                             tick={{ fill: '#ffffff80', fontSize: 10, fontWeight: 'bold' }} 
                             axisLine={{ stroke: '#ffffff20' }}
                           />
                           <YAxis 
                             stroke="#ffffff40" 
                             tick={{ fill: '#ffffff80', fontSize: 9 }} 
                             axisLine={{ stroke: '#ffffff20' }}
                             tickFormatter={(val) => chartMetric === 'revenue' ? `${(val/1000000).toFixed(1)}M` : `${val}`}
                           />
                           <Tooltip content={<CustomChartTooltip />} />
                           <Area 
                             type="monotone" 
                             dataKey={chartMetric === 'revenue' ? 'revenue' : 'ordersCount'} 
                             name={chartMetric === 'revenue' ? 'Revenu (F CFA)' : 'Commandes'}
                             stroke={chartMetric === 'revenue' ? '#D4AF37' : '#10B981'} 
                             strokeWidth={3}
                             fillOpacity={1} 
                             fill={`url(#${chartMetric === 'revenue' ? 'colorRevenueGradient' : 'colorOrdersGradient'})`} 
                           />
                        </AreaChart>
                     ) : (
                        <BarChart data={monthlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                           <XAxis 
                             dataKey="month" 
                             stroke="#ffffff40" 
                             tick={{ fill: '#ffffff80', fontSize: 10, fontWeight: 'bold' }} 
                             axisLine={{ stroke: '#ffffff20' }}
                           />
                           <YAxis 
                             stroke="#ffffff40" 
                             tick={{ fill: '#ffffff80', fontSize: 9 }} 
                             axisLine={{ stroke: '#ffffff20' }}
                             tickFormatter={(val) => chartMetric === 'revenue' ? `${(val/1000000).toFixed(1)}M` : `${val}`}
                           />
                           <Tooltip content={<CustomChartTooltip />} />
                           <Bar 
                             dataKey={chartMetric === 'revenue' ? 'revenue' : 'ordersCount'} 
                             radius={[8, 8, 0, 0]}
                           >
                              {monthlySalesData.map((entry, index) => (
                                 <Cell 
                                   key={`cell-${index}`} 
                                   fill={chartMetric === 'revenue' ? (entry.revenue > 3000000 ? '#D4AF37' : '#FF6B00') : '#10B981'} 
                                   fillOpacity={entry.revenue === 0 && entry.ordersCount === 0 ? 0.2 : 0.85}
                                 />
                              ))}
                           </Bar>
                        </BarChart>
                     )}
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Popular Dishes */}
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
               <h3 className="text-lg font-black italic uppercase text-brand-gold mb-6">Plats en vogue</h3>
               <div className="space-y-4">
                  {items.slice(0, 3).map((it, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                       <img src={it.image} className="w-12 h-12 rounded-xl object-cover" alt={it.name} />
                       <div className="flex-1">
                          <p className="font-black text-[10px] uppercase tracking-tighter text-white/80">{it.name}</p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2">
                             <div className="bg-brand-orange h-full rounded-full" style={{ width: `${95 - idx*10}%` }}></div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case AdminView.MENU_MGMT:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-[10px] font-bold uppercase flex items-center justify-between gap-2 shadow-inner">
              <span className="flex items-center gap-2">
                <Save size={16} /> Sauvegarde Sécurisée Pérrenne Active — (LocalStorage + IndexedDB + Cloud)
              </span>
              <span className="text-[9px] text-emerald-300/80 italic font-normal">
                {items.length} plat(s) sauvegardé(s)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                 <h3 className="text-xl font-black italic uppercase text-brand-gold">Gestion de la Carte</h3>
                 <p className="text-[10px] text-white/50">Modifiez les photos, prix, descriptions ou ajoutez de nouveaux plats.</p>
               </div>
               <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                 <button 
                   type="button"
                   onClick={async () => {
                     if (!isSupabaseConfigured) {
                       alert("⚠️ Supabase n'est pas encore configuré avec les clés d'environnement.");
                       return;
                     }
                     playSound('pop');
                     const res = await db.syncAllMenuItems(items);
                     if (res.success) {
                       playSound('success');
                       alert(`✅ Félicitations ! ${res.count} plats ont été synchronisés sur Supabase. Tous vos clients recevront ces plats automatiquement !`);
                     } else {
                       alert(`❌ Erreur d'envoi vers Supabase : ${res.error}\n\nAssurez-vous d'avoir exécuté le script SQL mis à jour dans Supabase (politiques RLS autorisées).`);
                     }
                   }}
                   className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl flex items-center gap-2 font-black text-[9px] uppercase tracking-wider transition-all border border-emerald-400/30 shadow-md"
                   title="Envoyer tous les plats vers Supabase pour que tous les clients les voient"
                 >
                   <Database size={14} /> Pousser vers Cloud ({items.length})
                 </button>
                 <button 
                   type="button"
                   onClick={() => {
                     if (window.confirm('Voulez-vous synchroniser la carte avec le catalogue officiel (incluant Couscous Royal, Tiep Rouge Royal, Suya de Didi) ?')) {
                       playSound('success');
                       setItems(MENU_ITEMS);
                       try {
                         localStorage.setItem('khadys_menu_items', JSON.stringify(MENU_ITEMS));
                       } catch (e) {}
                     }
                   }}
                   className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl flex items-center gap-2 font-black text-[9px] uppercase tracking-wider transition-all border border-white/10"
                   title="Restaurer ou mettre à jour avec les plats officiels"
                 >
                   <RefreshCw size={14} /> Sync Plats Officiels
                 </button>
                 <button onClick={() => setEditingItem({})} className="bg-brand-gold hover:bg-amber-400 text-brand-brown px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-[10px] uppercase italic active:scale-95 transition-all">
                   <Plus size={18}/> Ajouter un Plat
                 </button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {items.map(item => (
                 <div key={item.id} className="bg-white/5 p-5 rounded-[2.5rem] border border-white/5 group relative overflow-hidden transition-all hover:bg-white/10">
                    <img src={item.image} className="w-full h-32 rounded-[2rem] object-cover opacity-80 mb-4" />
                    <h4 className="font-black text-xs italic text-brand-gold uppercase truncate mb-1">{item.name}</h4>
                    <p className="text-xs font-black text-brand-orange mb-4">{item.price} F</p>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingItem(item)} className="flex-1 bg-white/5 p-3 rounded-xl text-white/40 hover:text-white hover:bg-brand-gold/20 flex items-center justify-center transition-all"><Edit3 size={16}/></button>
                       <button onClick={() => { 
                         playSound('pop');
                         setDeleteConfirmTarget({
                           type: 'dish',
                           id: item.id,
                           name: item.name,
                           category: item.category,
                           image: item.image,
                           onConfirm: () => {
                             setItems(prev => prev.filter(i => i.id !== item.id));
                             if (isSupabaseConfigured) db.deleteMenuItem(item.id);
                           }
                         });
                       }} className="flex-1 bg-rose-500/10 p-3 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all group-hover:scale-105" title="Supprimer ce plat"><Trash2 size={16}/></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );

      case AdminView.BLOG_MGMT:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black italic uppercase text-brand-gold flex items-center gap-2">
                 <BookOpen size={20} /> Gestion du Blog Culinaire
               </h3>
               <button onClick={() => setEditingArticle({})} className="bg-brand-orange text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-[10px] uppercase italic active:scale-95 transition-all">
                 <Plus size={18}/> Rédiger un Article
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogArticles.map(art => (
                <div key={art.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full">
                      {art.category}
                    </span>
                    <h4 className="font-black text-sm italic text-white uppercase leading-snug">{art.title}</h4>
                    <p className="text-[10px] text-white/50 line-clamp-2">{art.summary}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[8px] text-white/30 font-bold uppercase">{art.author} • {art.date}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingArticle(art)} className="p-2.5 bg-white/5 rounded-xl text-brand-gold hover:bg-brand-gold hover:text-brand-brown transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => { 
                        playSound('pop');
                        setDeleteConfirmTarget({
                          type: 'article',
                          id: art.id,
                          name: art.title,
                          category: art.category,
                          image: art.image,
                          onConfirm: () => {
                            setBlogArticles(prev => prev.filter(a => a.id !== art.id));
                          }
                        });
                      }} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Supprimer cet article">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case AdminView.FAQ_MGMT:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black italic uppercase text-brand-gold flex items-center gap-2">
                 <HelpCircle size={20} /> Gestion FAQ & Aide
               </h3>
               <button onClick={() => setEditingFaq({})} className="bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-[10px] uppercase italic active:scale-95 transition-all">
                 <Plus size={18}/> Nouvelle Question
               </button>
            </div>

            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <span className="text-[8px] font-black uppercase text-brand-orange">{faq.category}</span>
                    <h4 className="font-black text-xs text-white italic uppercase">{faq.question}</h4>
                    <p className="text-[10px] text-white/60 leading-relaxed mt-1">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingFaq(faq)} className="p-2.5 bg-white/5 rounded-xl text-brand-gold hover:bg-brand-gold hover:text-brand-brown transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => { 
                      playSound('pop');
                      setDeleteConfirmTarget({
                        type: 'faq',
                        id: faq.id,
                        name: faq.question,
                        category: faq.category,
                        onConfirm: () => {
                          setFaqs(prev => prev.filter(f => f.id !== faq.id));
                        }
                      });
                    }} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Supprimer cette question">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case AdminView.ORDERS:
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Commandes en Direct</h3>
             <div className="space-y-4">
                {orders.length === 0 ? <p className="text-center py-20 opacity-20 italic">Aucune commande aujourd'hui</p> : 
                orders.map(o => (
                  <div key={o.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 relative group">
                     <div className="absolute top-0 right-0 p-4 bg-brand-orange/10 rounded-bl-[2rem] text-brand-orange font-black text-[10px]">{o.status}</div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <h4 className="font-black text-brand-gold italic text-sm">{o.customerName}</h4>
                           <span className="text-[8px] px-2 py-0.5 bg-white/10 rounded-full font-bold">{o.id}</span>
                        </div>
                        <div className="space-y-1 bg-black/20 p-4 rounded-2xl">
                           {o.items.map((it, idx) => <p key={idx} className="text-[10px] text-white/60 font-bold">• {it.quantity} x {it.name}</p>)}
                        </div>
                     </div>
                     <div className="md:w-64 grid grid-cols-2 gap-2">
                        {['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED'].map(s => (
                          <button key={s} onClick={() => updateOrderStatus(o.id, s as OrderStatus)} className={`p-2 rounded-xl text-[7px] font-black uppercase transition-all ${o.status === s ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}>{s}</button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );

      case AdminView.EVENT:
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Gestion Événements</h3>
             <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6">
                <div className="p-6 bg-brand-orange/10 border border-brand-orange/20 rounded-3xl flex justify-between items-center transition-all hover:bg-brand-orange/20 cursor-pointer">
                   <div>
                      <h4 className="font-black text-white italic text-sm">Mariage Royal - Plateau</h4>
                      <p className="text-[10px] text-white/40 uppercase font-bold">200 Invités • 20 Décembre • En attente de devis</p>
                   </div>
                   <button className="bg-brand-orange text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg">Éditer</button>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center opacity-40">
                   <div>
                      <h4 className="font-black text-white italic text-sm">Cocktail Pro - Yantala</h4>
                      <p className="text-[10px] text-white/40 uppercase font-bold">50 Personnes • Terminé</p>
                   </div>
                   <CheckCircle2 size={20} className="text-green-500" />
                </div>
             </div>
          </div>
        );

      case AdminView.BUFFET:
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Packs Buffet Pro</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.filter(i => i.category === 'Pack-Buffet' || i.category === 'Pack').map((p, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex gap-5 items-center">
                     <img src={p.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                     <div className="flex-1">
                        <h4 className="font-black text-[10px] text-brand-gold italic uppercase">{p.name}</h4>
                        <p className="text-brand-orange font-black text-sm">{p.price} F</p>
                     </div>
                     <button onClick={() => setEditingItem(p)} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><Edit3 size={16}/></button>
                  </div>
                ))}
             </div>
          </div>
        );

      case AdminView.CLIENTS:
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Gestion Clientèle Elite</h3>
             <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-white/30">
                      <tr>
                         <th className="p-6">Client</th>
                         <th className="p-6">Rang</th>
                         <th className="p-6">Points</th>
                         <th className="p-6">Dernière commande</th>
                      </tr>
                   </thead>
                   <tbody className="text-[10px] font-bold">
                      {[
                        { name: 'Abdou R.', rank: 'Gold', points: 1250, date: 'Aujourd\'hui' },
                        { name: 'Mariama K.', rank: 'Silver', points: 450, date: 'Hier' },
                        { name: 'Issoufou Z.', rank: 'Platinum', points: 5200, date: 'Il y a 2 jours' }
                      ].map((c, i) => (
                        <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="p-6 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/10" /> {c.name}</td>
                           <td className="p-6"><span className={`px-3 py-1 rounded-full text-[7px] ${c.rank === 'Platinum' ? 'bg-brand-gold text-brand-brown' : 'bg-white/10 text-white/60'}`}>{c.rank}</span></td>
                           <td className="p-6 text-brand-orange">{c.points}</td>
                           <td className="p-6 opacity-40">{c.date}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case AdminView.DELIVERY:
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Flotte Billo Express</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Sani D.', status: 'En livraison', zone: 'Plateau', phone: '+227 96 00 00 01' },
                  { name: 'Moussa B.', status: 'Disponible', zone: 'Base', phone: '+227 96 00 00 02' },
                  { name: 'Idé G.', status: 'En pause', zone: 'Goudel', phone: '+227 96 00 00 03' }
                ].map((l, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5">
                     <div className="w-16 h-16 bg-brand-orange/20 rounded-2xl flex items-center justify-center text-brand-orange"><Bike size={32} /></div>
                     <div className="flex-1">
                        <h4 className="font-black text-xs text-white italic uppercase">{l.name}</h4>
                        <p className="text-[9px] font-bold text-white/40 uppercase mb-2">{l.phone}</p>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${l.status === 'En livraison' ? 'bg-brand-orange' : l.status === 'Disponible' ? 'bg-green-500' : 'bg-gray-500'}`} />
                           <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">{l.status} • {l.zone}</span>
                        </div>
                     </div>
                     <button className="bg-white/5 p-3 rounded-xl text-white/20 hover:text-white transition-all"><MessageCircle size={18}/></button>
                  </div>
                ))}
             </div>
          </div>
        );

      case AdminView.PLAT_DU_JOUR:
        return (
          <AdminMarketingCenter 
            items={items} 
            orders={orders} 
            onItemsChange={setItems}
            initialTab="PLAT_DU_JOUR"
          />
        );

      case AdminView.AI_MARKETING:
        return (
          <AdminMarketingCenter 
            items={items} 
            orders={orders} 
            onItemsChange={setItems} 
          />
        );

      case AdminView.SETTINGS:
        return (
          <div className="space-y-8 animate-fade-in">
             <h3 className="text-xl font-black italic uppercase text-brand-gold">Configuration de l'Établissement</h3>
             <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                <div className="flex items-center justify-between p-6 bg-black/20 rounded-3xl border border-white/5">
                   <div>
                      <h4 className="font-black text-white italic text-sm uppercase">Statut Restaurant</h4>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{isRestaurantOpen ? 'Ouvert - Accepte les commandes' : 'Fermé - Indisponible'}</p>
                   </div>
                   <button onClick={() => setIsRestaurantOpen(!isRestaurantOpen)} className={`w-16 h-8 rounded-full relative p-1 transition-all ${isRestaurantOpen ? 'bg-brand-orange' : 'bg-white/10'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-all ${isRestaurantOpen ? 'translate-x-8' : 'translate-x-0'} shadow-xl`}></div>
                   </button>
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-brand-gold uppercase text-[10px] ml-4 tracking-[0.3em]">Contact WhatsApp Live</h4>
                   <input className="w-full p-5 bg-white/5 rounded-2xl text-white font-bold border border-white/10 outline-none focus:border-brand-gold" defaultValue="+227 74 44 16 21" />
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-brand-gold uppercase text-[10px] ml-4 tracking-[0.3em]">Code Promo Actif</h4>
                   <input className="w-full p-5 bg-white/5 rounded-2xl text-white font-bold border border-white/10 outline-none focus:border-brand-gold" defaultValue="KHADY24" />
                </div>
                <button className="w-full bg-brand-gold text-brand-brown py-6 rounded-3xl font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   <Save size={20}/> Appliquer les Paramètres
                </button>
             </div>
          </div>
        );

      default:
        return <div className="text-center py-20 text-white/20 italic">Module en développement...</div>;
    }
  };

  const navItems = [
    { v: AdminView.DASHBOARD, i: LayoutDashboard, l: 'Home' },
    { v: AdminView.PLAT_DU_JOUR, i: Sun, l: 'Plat du Jour' },
    { v: AdminView.MENU_MGMT, i: Utensils, l: 'Carte' },
    { v: AdminView.BLOG_MGMT, i: BookOpen, l: 'Blog' },
    { v: AdminView.FAQ_MGMT, i: HelpCircle, l: 'FAQ' },
    { v: AdminView.ORDERS, i: ShoppingBag, l: 'Orders' },
    { v: AdminView.DELIVERY, i: Bike, l: 'Livreurs' },
    { v: AdminView.CLIENTS, i: Users, l: 'Clients' },
    { v: AdminView.AI_MARKETING, i: Zap, l: 'Marketing' },
    { v: AdminView.EVENT, i: Calendar, l: 'Évents' },
    { v: AdminView.BUFFET, i: ChefHat, l: 'Buffet' },
    { v: AdminView.SETTINGS, i: Settings, l: 'Settings' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0F0807] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      <input 
        type="file" 
        ref={adminPhotoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleAdminPhotoChange}
      />

      {/* Desktop Sidebar Admin (md:flex) */}
      <div className="hidden md:flex w-24 bg-black/40 border-r border-white/5 flex-col items-center py-8 gap-5 overflow-y-auto no-scrollbar flex-shrink-0">
        <KhadyLogo variant="light" className="scale-75 mb-2" />
        {navItems.map(n => (
          <button key={n.l} onClick={() => { setCurrentView(n.v); playSound('pop'); }} className={`flex flex-col items-center transition-all duration-300 ${currentView === n.v ? 'scale-110 opacity-100' : 'opacity-20 hover:opacity-100'}`}>
             <div className={`p-3 rounded-2xl ${currentView === n.v ? 'bg-brand-orange text-white shadow-xl' : 'bg-white/5'}`}><n.i size={20} /></div>
             <span className="text-[6px] mt-1.5 font-black tracking-widest uppercase text-center w-20 leading-tight">{n.l}</span>
          </button>
        ))}
        <button onClick={onExit} title="Quitter le Dashboard Admin" className="mt-auto p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 flex flex-col items-center gap-1">
          <Power size={22}/>
          <span className="text-[6px] font-black uppercase tracking-widest">Quitter</span>
        </button>
      </div>

      {/* Mobile Horizontal Navigation Header (md:hidden) */}
      <div className="flex md:hidden bg-black/60 border-b border-white/10 px-3 py-2.5 overflow-x-auto no-scrollbar flex-shrink-0 items-center gap-2 z-30">
        <KhadyLogo variant="light" className="scale-50 shrink-0 -mr-2" />
        {navItems.map(n => (
          <button 
            key={n.l} 
            onClick={() => { setCurrentView(n.v); playSound('pop'); }} 
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 transition-all text-[10px] font-black uppercase tracking-wider ${
              currentView === n.v ? 'bg-brand-orange text-white shadow-lg' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            <n.i size={14} />
            <span>{n.l}</span>
          </button>
        ))}
        <button 
          onClick={onExit} 
          className="px-3 py-2 bg-rose-500/20 text-rose-300 rounded-xl shrink-0 text-[10px] font-black uppercase flex items-center gap-1 border border-rose-500/30"
        >
          <Power size={14} /> Quitter
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="p-4 md:p-8 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md relative z-20 gap-2">
           <div>
              <h2 className="text-xs md:text-sm font-black italic uppercase text-brand-gold tracking-[0.2em] leading-none">Console Admin Elite</h2>
              <p className="text-[7px] md:text-[8px] text-white/40 font-black uppercase mt-1 tracking-wider">Terminal de Gestion — Khady's Food</p>
           </div>
           
           <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={onExit}
                className="px-3 md:px-4 py-2 md:py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shrink-0"
              >
                 <Power size={14} /> <span className="hidden sm:inline">Quitter Admin</span>
              </button>

              <div 
                onClick={() => adminPhotoInputRef.current?.click()}
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-2xl hover:border-brand-orange transition-all flex-shrink-0"
                title="Changer la photo de profil Admin"
              >
                 {adminAvatar ? <img src={adminAvatar} className="w-full h-full object-cover" alt="Admin Avatar" /> : <Camera className="text-brand-gold opacity-20" size={20} />}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Camera size={14} className="text-white" />
                 </div>
              </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-gradient-to-br from-transparent to-brand-orange/[0.02]">{renderContent()}</div>
      </div>

      {/* Modal d'édition/ajout de plat */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-brand-brown w-full max-w-sm rounded-[3.5rem] p-10 border-4 border-white/10 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
              <button onClick={() => setEditingItem(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black italic uppercase text-brand-gold mb-8 tracking-tighter leading-none">{editingItem.id ? 'Éditer le Plat' : 'Nouveau Plat'}</h3>
              <form onSubmit={handleSaveItem} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Nom du plat</label>
                    <input required value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-xs font-bold border border-white/10 outline-none focus:border-brand-gold" placeholder="Ex: Tiep Royal" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-white/30 ml-4">Prix (F CFA)</label>
                       <input type="number" required value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-xs font-bold border border-white/10" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-white/30 ml-4">Catégorie</label>
                       <select value={editingItem.category || 'Plat Africain'} onChange={e => setEditingItem({...editingItem, category: e.target.value as any})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] font-black border border-white/10 outline-none">
                          <option value="Plat Africain">Plat Africain</option>
                          <option value="Spécialité Maison">Spécialité</option>
                          <option value="Box Sauce">Box Sauce</option>
                          <option value="Pack-Buffet">Pack-Buffet</option>
                          <option value="Boisson Froide">Boisson</option>
                          <option value="Dessert">Dessert</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Photo du Plat</label>
                    <input 
                       type="file" 
                       ref={dishPhotoInputRef} 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleDishPhotoChange} 
                    />
                    
                    {editingItem.image && (
                       <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-white/20 mb-2 group">
                          <img src={editingItem.image} alt="Aperçu plat" className="w-full h-full object-cover" />
                          <button 
                             type="button" 
                             onClick={() => {
                               playSound('pop');
                               setDeleteConfirmTarget({
                                 type: 'media',
                                 id: 'photo_dish',
                                 name: editingItem.name ? `Photo du plat "${editingItem.name}"` : 'Photo du plat',
                                 image: editingItem.image,
                                 onConfirm: () => {
                                   setEditingItem(prev => prev ? { ...prev, image: '' } : null);
                                 }
                               });
                             }} 
                             className="absolute top-2 right-2 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-500 transition-colors shadow-lg"
                             title="Supprimer la photo"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    )}

                    <button 
                       type="button" 
                       onClick={() => dishPhotoInputRef.current?.click()} 
                       className="w-full p-4 bg-brand-gold/15 border border-brand-gold/40 hover:bg-brand-gold/25 text-brand-gold rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                    >
                       <Camera size={18} /> Importer depuis Galerie / Appareil
                    </button>

                    <div className="pt-1">
                       <span className="text-[7px] text-white/40 uppercase font-black tracking-widest block mb-1">Ou saisir un lien URL :</span>
                       <input value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} className="w-full p-3 bg-white/5 rounded-xl text-white text-[10px] border border-white/10 outline-none focus:border-brand-gold" placeholder="https://..." />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Description</label>
                    <textarea value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] h-24 border border-white/10 resize-none" placeholder="Détails du plat..." />
                 </div>

                 {/* Tags & Attribute Filters */}
                 <div className="space-y-2 pt-1">
                    <label className="text-[8px] font-black uppercase text-brand-gold ml-4">Tags & Filtres de Sélection</label>
                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/80 hover:text-white">
                          <input 
                             type="checkbox" 
                             checked={!!editingItem.isPlatDuJour} 
                             onChange={e => setEditingItem({...editingItem, isPlatDuJour: e.target.checked})}
                             className="rounded accent-brand-gold w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>🌟 Plat du Jour</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/80 hover:text-white">
                          <input 
                             type="checkbox" 
                             checked={!!editingItem.isSpécialitéMaison} 
                             onChange={e => setEditingItem({...editingItem, isSpécialitéMaison: e.target.checked})}
                             className="rounded accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>👑 Spécialité</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/80 hover:text-white">
                          <input 
                             type="checkbox" 
                             checked={!!editingItem.isSpicy} 
                             onChange={e => setEditingItem({...editingItem, isSpicy: e.target.checked})}
                             className="rounded accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>🌶️ Épicé</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/80 hover:text-white">
                          <input 
                             type="checkbox" 
                             checked={!!editingItem.isVegetarian} 
                             onChange={e => setEditingItem({...editingItem, isVegetarian: e.target.checked})}
                             className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>🌿 Végétarien</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/80 hover:text-white col-span-2">
                          <input 
                             type="checkbox" 
                             checked={!!editingItem.isPromo} 
                             onChange={e => setEditingItem({...editingItem, isPromo: e.target.checked})}
                             className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>🏷️ En Promotion / Offre Spéciale</span>
                       </label>
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-brand-orange text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
                    {editingItem.id ? 'Mettre à jour' : 'Ajouter à la Carte'} <CheckCircle2 size={20}/>
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal d'édition/ajout d'article de blog */}
      {editingArticle && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-brand-brown w-full max-w-sm rounded-[3.5rem] p-10 border-4 border-white/10 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
              <button onClick={() => setEditingArticle(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black italic uppercase text-brand-gold mb-8 tracking-tighter leading-none">{editingArticle.id ? 'Éditer l\'Article' : 'Nouveau Billet Blog'}</h3>
              <form onSubmit={handleSaveArticle} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Titre de l'article</label>
                    <input required value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-xs font-bold border border-white/10 outline-none focus:border-brand-gold" placeholder="Ex: Les secrets du Dambou" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Catégorie</label>
                    <select value={editingArticle.category || 'Secrets du Chef'} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as any})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] font-black border border-white/10 outline-none">
                       <option value="Secrets du Chef">Secrets du Chef</option>
                       <option value="Recettes">Recettes</option>
                       <option value="Nutrition Sahel">Nutrition Sahel</option>
                       <option value="Événements">Événements</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Photo d'Illustration HD</label>
                    <input 
                       type="file" 
                       ref={articlePhotoInputRef} 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleArticlePhotoChange} 
                    />

                    {editingArticle.image && (
                       <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-white/20 mb-2 group">
                          <img src={editingArticle.image} alt="Aperçu article" className="w-full h-full object-cover" />
                          <button 
                             type="button" 
                             onClick={() => {
                               playSound('pop');
                               setDeleteConfirmTarget({
                                 type: 'media',
                                 id: 'photo_article',
                                 name: editingArticle.title ? `Image de l'article "${editingArticle.title}"` : 'Illustration article',
                                 image: editingArticle.image,
                                 onConfirm: () => {
                                   setEditingArticle(prev => prev ? { ...prev, image: '' } : null);
                                 }
                               });
                             }} 
                             className="absolute top-2 right-2 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-500 transition-colors shadow-lg"
                             title="Supprimer la photo"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    )}

                    <button 
                       type="button" 
                       onClick={() => articlePhotoInputRef.current?.click()} 
                       className="w-full p-4 bg-brand-gold/15 border border-brand-gold/40 hover:bg-brand-gold/25 text-brand-gold rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                    >
                       <Camera size={18} /> Importer depuis Galerie
                    </button>

                    <div className="pt-1">
                       <span className="text-[7px] text-white/40 uppercase font-black tracking-widest block mb-1">Ou lien URL :</span>
                       <input value={editingArticle.image || ''} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} className="w-full p-3 bg-white/5 rounded-xl text-white text-[10px] border border-white/10 outline-none focus:border-brand-gold" placeholder="https://..." />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Contenu Complet</label>
                    <textarea required value={editingArticle.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] h-32 border border-white/10 resize-none" placeholder="Rédigez l'article..." />
                 </div>
                 <button type="submit" className="w-full bg-brand-orange text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
                    {editingArticle.id ? 'Mettre à jour' : 'Publier sur le Blog'} <CheckCircle2 size={20}/>
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal d'édition/ajout de FAQ */}
      {editingFaq && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-brand-brown w-full max-w-sm rounded-[3.5rem] p-10 border-4 border-white/10 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
              <button onClick={() => setEditingFaq(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black italic uppercase text-brand-gold mb-8 tracking-tighter leading-none">{editingFaq.id ? 'Éditer la Question' : 'Nouvelle Question FAQ'}</h3>
              <form onSubmit={handleSaveFaq} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Catégorie</label>
                    <select value={editingFaq.category || 'Paiement'} onChange={e => setEditingFaq({...editingFaq, category: e.target.value as any})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] font-black border border-white/10 outline-none">
                       <option value="Paiement">Paiement</option>
                       <option value="Livraison">Livraison</option>
                       <option value="Commandes">Commandes</option>
                       <option value="Traiteur">Traiteur</option>
                       <option value="Fidélité">Fidélité</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Question</label>
                    <input required value={editingFaq.question || ''} onChange={e => setEditingFaq({...editingFaq, question: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-xs font-bold border border-white/10 outline-none focus:border-brand-gold" placeholder="Ex: Livrez-vous à Goudel ?" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Réponse détaillée</label>
                    <textarea required value={editingFaq.answer || ''} onChange={e => setEditingFaq({...editingFaq, answer: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] h-28 border border-white/10 resize-none" placeholder="Expliquez la réponse..." />
                 </div>
                 <button type="submit" className="w-full bg-brand-gold text-brand-brown py-6 rounded-[2.5rem] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4">
                    {editingFaq.id ? 'Mettre à jour' : 'Enregistrer la FAQ'} <CheckCircle2 size={20}/>
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Dialogue Visuel Sécurisé de Confirmation de Suppression */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1C0F0D] border-2 border-rose-500/40 w-full max-w-sm rounded-[3.5rem] p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
            {/* Arrière plan lumineux dynamique rouge */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Bouton Fermer */}
            <button 
              onClick={() => { playSound('pop'); setDeleteConfirmTarget(null); }}
              className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Icône Corbeille / Alerte Animée */}
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={32} className="animate-bounce" />
            </div>

            {/* Titre & Type d'élément */}
            <div>
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full italic inline-block mb-2">
                {deleteConfirmTarget.type === 'dish' && '🗑️ Plat du Menu'}
                {deleteConfirmTarget.type === 'article' && '🗑️ Billet de Blog'}
                {deleteConfirmTarget.type === 'faq' && '🗑️ Question FAQ'}
                {deleteConfirmTarget.type === 'media' && '🖼️ Fichier Média / Photo'}
              </span>
              <h3 className="text-lg font-black text-white italic uppercase tracking-tight">
                Confirmer la suppression ?
              </h3>
              <p className="text-[11px] font-medium text-white/60 mt-1">
                Cette opération supprimera définitivement cet élément.
              </p>
            </div>

            {/* Carte Aperçu de l'élément à supprimer */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-left space-y-3">
              {deleteConfirmTarget.image && (
                <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10 relative">
                  <img src={deleteConfirmTarget.image} alt={deleteConfirmTarget.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                    Aperçu Média
                  </span>
                </div>
              )}
              <div>
                <div className="text-[9px] font-black uppercase text-brand-gold/70">Intitulé :</div>
                <div className="text-xs font-black text-white italic uppercase line-clamp-2">
                  {deleteConfirmTarget.name}
                </div>
                {deleteConfirmTarget.category && (
                  <div className="text-[9px] font-bold text-white/40 mt-1">
                    Catégorie : <span className="text-brand-orange">{deleteConfirmTarget.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message de Sécurité */}
            <div className="flex items-center gap-2 bg-rose-950/50 p-3 rounded-xl border border-rose-500/30 text-rose-300 text-[10px] text-left font-semibold">
              <ShieldAlert size={18} className="shrink-0 text-rose-400" />
              <span>Suppression sécurisée instantanée dans le système.</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { playSound('pop'); setDeleteConfirmTarget(null); }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase py-4 rounded-2xl tracking-wider active:scale-95 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteConfirmTarget.onConfirm();
                  setDeleteConfirmTarget(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase py-4 rounded-2xl tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
