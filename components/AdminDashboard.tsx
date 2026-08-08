import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Utensils, X, TrendingUp, Star, 
  Settings, Bike, Sparkles, Zap, Plus, Trash2, 
  Edit3, Power, RefreshCw, Users, Package, 
  Calendar, Smartphone, CheckCircle2, ChefHat, PackageCheck, Bell, Camera, 
  MapPin, Clock, Heart, Sliders, DollarSign, MessageCircle, AlertCircle,
  UserRound, Save, ToggleLeft as Toggle, Image as ImageIcon, BookOpen, HelpCircle
} from 'lucide-react';
import { MenuItem, AdminView, Order, Review, MenuCategory, OrderStatus, BlogArticle, FaqItem } from '../types';
import { KhadyLogo } from './KhadyLogo';
import { playSound } from '../utils/audio';
import { GoogleGenAI } from "@google/genai";
import { DISTRICTS, BILLO_INFO } from '../constants';

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  items, setItems, onExit, setOrders, orders, reviews, setReviews,
  blogArticles, setBlogArticles, faqs, setFaqs
}) => {
  const [currentView, setCurrentView] = useState<AdminView>(AdminView.DASHBOARD);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<BlogArticle> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState('');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const adminPhotoInputRef = useRef<HTMLInputElement>(null);
  const dishPhotoInputRef = useRef<HTMLInputElement>(null);
  const articlePhotoInputRef = useRef<HTMLInputElement>(null);
  const [adminAvatar, setAdminAvatar] = useState(() => localStorage.getItem('khadys_admin_avatar') || '');

  const handleAdminPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAdminAvatar(base64String);
        localStorage.setItem('khadys_admin_avatar', base64String);
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDishPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditingItem(prev => prev ? { ...prev, image: base64String } : null);
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArticlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditingArticle(prev => prev ? { ...prev, image: base64String } : null);
        playSound('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.price) return;

    const finalItem = {
      ...editingItem,
      id: editingItem.id || `item-${Date.now()}`,
      rating: editingItem.rating || 5,
      isAvailable: editingItem.isAvailable ?? true,
      category: editingItem.category || 'Plat Africain',
      image: editingItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
    } as MenuItem;

    if (items.find(i => i.id === finalItem.id)) {
      setItems(prev => prev.map(i => i.id === finalItem.id ? finalItem : i));
    } else {
      setItems(prev => [finalItem, ...prev]);
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Ventes Jour', val: '645.000 F', icon: DollarSign, col: 'text-brand-gold' },
                 { label: 'En attente', val: orders.filter(o => o.status === 'RECEIVED').length, icon: ShoppingBag, col: 'text-brand-orange' },
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
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
               <h3 className="text-lg font-black italic uppercase text-brand-gold mb-6">Plats en vogue</h3>
               <div className="space-y-4">
                  {items.slice(0, 3).map((it, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                       <img src={it.image} className="w-12 h-12 rounded-xl object-cover" />
                       <div className="flex-1">
                          <p className="font-black text-[10px] uppercase tracking-tighter text-white/80">{it.name}</p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2"><div className="bg-brand-orange h-full rounded-full" style={{ width: `${95 - idx*10}%` }}></div></div>
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
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black italic uppercase text-brand-gold">Gestion de la Carte</h3>
               <button onClick={() => setEditingItem({})} className="bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-[10px] uppercase italic active:scale-95 transition-all">
                 <Plus size={18}/> Ajouter un Plat
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {items.map(item => (
                 <div key={item.id} className="bg-white/5 p-5 rounded-[2.5rem] border border-white/5 group relative overflow-hidden transition-all hover:bg-white/10">
                    <img src={item.image} className="w-full h-32 rounded-[2rem] object-cover opacity-80 mb-4" />
                    <h4 className="font-black text-xs italic text-brand-gold uppercase truncate mb-1">{item.name}</h4>
                    <p className="text-xs font-black text-brand-orange mb-4">{item.price} F</p>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingItem(item)} className="flex-1 bg-white/5 p-3 rounded-xl text-white/40 hover:text-white hover:bg-brand-gold/20 flex items-center justify-center transition-all"><Edit3 size={16}/></button>
                       <button onClick={() => { if(confirm("Supprimer " + item.name + " ?")) setItems(items.filter(i => i.id !== item.id)) }} className="flex-1 bg-red-500/10 p-3 rounded-xl text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
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
                      <button onClick={() => { if(confirm("Supprimer l'article ?")) setBlogArticles(prev => prev.filter(a => a.id !== art.id)) }} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
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
                    <button onClick={() => { if(confirm("Supprimer cette FAQ ?")) setFaqs(prev => prev.filter(f => f.id !== faq.id)) }} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
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

      case AdminView.AI_MARKETING:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black italic uppercase text-brand-gold flex items-center gap-3"><Zap className="text-brand-orange" /> Marketing IA</h3>
                  <button onClick={runAiStrategy} disabled={isAiLoading} className="bg-brand-orange text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-lg hover:scale-105 transition-all">
                    {isAiLoading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />} Analyser le Stock
                  </button>
               </div>
               {aiStrategy ? (
                 <div className="p-8 bg-black/40 rounded-3xl border border-white/10 text-brand-gold/80 italic text-sm leading-relaxed animate-fade-in">
                   {aiStrategy}
                 </div>
               ) : <div className="text-center py-20 opacity-20 italic">Cliquez sur Analyser pour générer des textes de vente avec Gemini 3...</div>}
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-[#0F0807] text-white flex overflow-hidden font-sans">
      <input 
        type="file" 
        ref={adminPhotoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleAdminPhotoChange}
      />

      {/* Sidebar Admin Premium */}
      <div className="w-24 bg-black/40 border-r border-white/5 flex flex-col items-center py-10 gap-6 overflow-y-auto no-scrollbar">
        <KhadyLogo variant="light" className="scale-75 mb-6" />
        {[
          { v: AdminView.DASHBOARD, i: LayoutDashboard, l: 'Home' },
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
        ].map(n => (
          <button key={n.l} onClick={() => { setCurrentView(n.v); playSound('pop'); }} className={`flex flex-col items-center transition-all duration-300 ${currentView === n.v ? 'scale-110 opacity-100' : 'opacity-20 hover:opacity-100'}`}>
             <div className={`p-3 rounded-2xl ${currentView === n.v ? 'bg-brand-orange text-white shadow-xl' : 'bg-white/5'}`}><n.i size={20} /></div>
             <span className="text-[6px] mt-2 font-black tracking-widest uppercase text-center w-20 leading-tight">{n.l}</span>
          </button>
        ))}
        <button onClick={onExit} className="mt-auto p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><Power size={22}/></button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-8 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md relative z-20">
           <div><h2 className="text-sm font-black italic uppercase text-brand-gold tracking-[0.3em] leading-none">Console Admin Elite</h2><p className="text-[8px] text-white/20 font-black uppercase mt-1">Terminal de Contrôle Niamey</p></div>
           <div 
                onClick={() => adminPhotoInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-2xl hover:border-brand-orange transition-all"
              >
                 {adminAvatar ? <img src={adminAvatar} className="w-full h-full object-cover" /> : <Camera className="text-brand-gold opacity-20" size={24} />}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Camera size={16} className="text-white" />
                 </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-gradient-to-br from-transparent to-brand-orange/[0.02]">{renderContent()}</div>
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
                             onClick={() => setEditingItem({...editingItem, image: ''})} 
                             className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                          >
                             <X size={14} />
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
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/30 ml-4">Image HD</label>
                    <input value={editingArticle.image || ''} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] border border-white/10" placeholder="https://..." />
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
    </div>
  );
};

export default AdminDashboard;
