import React, { useState, useRef, useMemo } from 'react';
import { MenuItem, Order, Review } from '../types';
import {
  Plus, Edit3, Trash2, X, Upload, Sparkles, AlertCircle,
  Image as ImageIcon, Save, Eye, EyeOff, TrendingUp,
  LayoutGrid, Sun, Utensils, BookOpen, Power, Check,
  CheckCircle2, Database, Lock, ShoppingBag, Star
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { saveAdminDraft, getAdminPin, saveAdminPin } from '../utils/offlineDB';
import { saveSingleMenuItemToSupabase } from '../utils/supabaseClient';
import { AdminSupabaseModal } from './AdminSupabaseModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { isRestrictedFromDailyOrFeatured, INITIAL_MENU_ITEMS } from '../constants';

interface AdminProps {
  items: MenuItem[];
  onSaveItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onSetPlatDuJour?: (id: string) => void;
  isPlatDuJourVisible?: boolean;
  onTogglePlatDuJourVisible?: () => void;
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onClose: () => void;
  reviews?: Review[];
  onSaveReview?: (review: Review) => void;
  onDeleteReview?: (id: string) => void;
  onToggleVerifiedReview?: (id: string) => void;
}

const MENU_CATEGORIES = [
  'Spécialité Maison',
  'Plat Africain',
  'Déjeuner',
  'Dîner',
  'Petit-déjeuner',
  'Menu du Jour',
  'Entrée',
  'Boisson Naturelle',
  'Dessert',
  'Box Sauce',
  'Pack-Buffet',
];

export const AdminDashboard: React.FC<AdminProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onToggleFeatured,
  onSetPlatDuJour,
  isPlatDuJourVisible = true,
  onTogglePlatDuJourVisible,
  orders,
  onUpdateOrderStatus,
  onClose,
  reviews = [],
  onSaveReview,
  onDeleteReview,
  onToggleVerifiedReview
}) => {
  const [adminTab, setAdminTab] = useState<'home' | 'platDuJour' | 'carte' | 'commandes' | 'avis'>('home');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPosterStudio, setShowPosterStudio] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState<string | null>(null);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Manager PIN update state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real metrics derived strictly from actual orders, menu items, and reviews
  const activeOrders = useMemo(
    () => (orders || []).filter(o => o && o.status !== 'cancelled'),
    [orders]
  );

  const totalRevenue = useMemo(
    () => activeOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [activeOrders]
  );

  const availableDishesCount = useMemo(
    () => (items || []).filter(i => i && i.available !== false).length,
    [items]
  );

  const salesData = useMemo(() => {
    if (activeOrders.length === 0) return [];
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const map = new Map<string, number>();
    activeOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const label = isNaN(d.getTime()) ? 'Récent' : monthNames[d.getMonth()];
      map.set(label, (map.get(label) || 0) + (Number(o.totalAmount) || 0));
    });
    return Array.from(map.entries()).map(([month, total]) => ({
      month,
      total: Math.round(total / 1000)
    }));
  }, [activeOrders]);

  // Sélection réelle du plat du jour : exclure strictement Doukounou & Attiéké
  const platDuJour =
    (items && items.length > 0)
      ? (items.find(i => i && i.isPlatDuJour && !isRestrictedFromDailyOrFeatured(i.name)) ||
         items.find(i => i && i.isFeatured && !isRestrictedFromDailyOrFeatured(i.name)) ||
         items.find(i => i && !isRestrictedFromDailyOrFeatured(i.name)) ||
         INITIAL_MENU_ITEMS[0])
      : INITIAL_MENU_ITEMS[0];

  const handleStartAdd = () => {
    const fresh: Partial<MenuItem> = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      price: 3500,
      category: 'Plat Africain',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      isFeatured: true,
      badge: 'Nouveau plat',
      preparationTime: '20-30 min',
      spicyLevel: 1,
      ingredients: ['Ingrédients frais du terroir', 'Épices de Niamey'],
      available: true,
      createdAt: new Date().toISOString()
    };
    setEditingItem(fresh);
    setIsNew(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleStartEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    saveAdminDraft(null);
  };

  const handleSave = () => {
    if (!editingItem || !editingItem.name || !editingItem.name.trim()) {
      setErrorMsg('Veuillez renseigner le nom du plat.');
      return;
    }

    if (!editingItem.price || Number(editingItem.price) <= 0) {
      setErrorMsg('Veuillez renseigner un prix valide supérieur à 0.');
      return;
    }

    if (!editingItem.image || !editingItem.image.trim()) {
      setErrorMsg('Veuillez sélectionner ou importer une image pour le plat.');
      return;
    }

    const isRestricted = isRestrictedFromDailyOrFeatured(editingItem.name);

    const itemToSave: MenuItem = {
      id: editingItem.id || `item-${Date.now()}`,
      name: editingItem.name.trim(),
      description: editingItem.description || '',
      price: Number(editingItem.price),
      oldPrice: editingItem.oldPrice,
      category: editingItem.category || 'Plat Africain',
      image: editingItem.image.trim(),
      rating: editingItem.rating ?? 5,
      isPopular: editingItem.isPopular ?? true,
      isFeatured: isRestricted ? false : (editingItem.isFeatured ?? true),
      isPlatDuJour: isRestricted ? false : Boolean(editingItem.isPlatDuJour),
      isSpecialiteMaison: editingItem.category === 'Spécialité Maison' || editingItem.isSpecialiteMaison,
      isSpécialitéMaison: editingItem.category === 'Spécialité Maison' || editingItem.isSpécialitéMaison,
      badge: editingItem.badge || (isRestricted ? 'Spécialité Permanente' : 'Nouveau'),
      preparationTime: editingItem.preparationTime || '20-30 min',
      spicyLevel: editingItem.spicyLevel ?? 1,
      ingredients: editingItem.ingredients || ['Spécialité Khady'],
      available: editingItem.available ?? true,
      createdAt: editingItem.createdAt || new Date().toISOString()
    };

    onSaveItem(itemToSave);
    saveAdminDraft(null);

    saveSingleMenuItemToSupabase(itemToSave).catch(e => {
      console.warn('Auto-sync Supabase failed (offline fallback active):', e);
    });

    setSuccessMsg(
      isRestricted
        ? `Plat "${itemToSave.name}" enregistré dans la carte permanente.`
        : `Plat "${itemToSave.name}" enregistré et synchronisé.`
    );
    setTimeout(() => {
      setEditingItem(null);
      setSuccessMsg(null);
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMsg(null);

    try {
      const compressedDataUrl = await compressImageFile(file, 900, 900, 0.82);
      setEditingItem(prev => ({
        ...prev,
        image: compressedDataUrl
      }));
      setSuccessMsg('Photo du plat importée et optimisée avec succès !');
    } catch (err) {
      console.error('Erreur compression image:', err);
      setErrorMsg("Impossible de charger cette image. Veuillez réessayer avec un format standard (JPG ou PNG).");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newPin.trim().length < 4) {
      setErrorMsg('Le nouveau code PIN doit contenir au moins 4 chiffres ou caractères.');
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg('La confirmation du code PIN ne correspond pas.');
      return;
    }
    saveAdminPin(newPin.trim());
    setNewPin('');
    setConfirmPin('');
    setSuccessMsg(`Code PIN gérant mis à jour (${getAdminPin().replace(/./g, '•')}).`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const allExistingCategories = useMemo(() => {
    const set = new Set<string>(MENU_CATEGORIES);
    (items || []).forEach(it => {
      if (it?.category) set.add(it.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = (items || []).filter(it => {
    if (!it) return false;
    const matchCat = filterCategory === 'tous' || it.category === filterCategory;
    const name = String(it.name || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase().trim();
    const matchQuery = !query || name.includes(query);
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-[#17120F] border-2 border-amber-500/40 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-[#F7F4EE]"
        onClick={e => e.stopPropagation()}
      >
        {/* TOP TABS */}
        <div className="px-3 sm:px-5 py-2.5 bg-[#110D0B] border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setAdminTab('home')}
              className={`px-3.5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all select-none ${
                adminTab === 'home'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>TABLEAU DE BORD</span>
            </button>

            <button
              onClick={() => setAdminTab('platDuJour')}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all select-none ${
                adminTab === 'platDuJour'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>PLAT DU JOUR</span>
            </button>

            <button
              onClick={() => setAdminTab('carte')}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all select-none ${
                adminTab === 'carte'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>CARTE ({items.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('commandes')}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all select-none ${
                adminTab === 'commandes'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>COMMANDES ({orders.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('avis')}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all select-none ${
                adminTab === 'avis'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>AVIS ({reviews.length})</span>
            </button>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 bg-stone-900 hover:bg-stone-850 text-emerald-400 border border-emerald-500/40 hover:text-white transition-all select-none"
              title="Paramètres Supabase & Schéma SQL"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL / SUPABASE</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONSOLE ADMIN HEADER */}
        <div className="px-5 py-4 bg-[#191310] border-b border-stone-800/80 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide text-[#FFD700] uppercase font-display">
              CONSOLE ADMIN ELITE
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-widest">
              TERMINAL DE GESTION — KHADY'S FOOD
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleStartAdd}
              className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 flex items-center justify-center hover:text-white"
              title="Ajouter un plat"
            >
              <Plus className="w-4 h-4 text-orange-400" />
            </button>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Paramètres Supabase & Schéma SQL"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SUPABASE</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-900 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-950/40"
              title="Quitter la console"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* EDIT / CREATE DISH DRAWER */}
          {editingItem && (
            <div className="p-5 rounded-3xl bg-[#201815] border-2 border-orange-500/60 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  <h3 className="font-black text-white text-base">
                    {isNew ? 'Créer un Nouveau Plat' : `Modifier "${editingItem.name}"`}
                  </h3>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Nom du Plat *</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: TIEP ROUGE ROYAL AU CAPITAINE"
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Prix (FCFA) *</label>
                      <input
                        type="number"
                        value={editingItem.price || ''}
                        onChange={e => setEditingItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="Ex: 3000"
                        className="w-full py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 text-xs font-bold focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Catégorie</label>
                      <select
                        value={editingItem.category || 'Plat Africain'}
                        onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                      >
                        {allExistingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.description || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description des saveurs, accompagnements et garnitures..."
                      className="w-full py-2 px-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-xs font-normal focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        Afficher dans les Incontournables ⭐
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Visible dans le carrousel de la page d'accueil
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingItem.isFeatured ?? true}
                      onChange={e => setEditingItem(prev => ({ ...prev, isFeatured: e.target.checked, isPopular: e.target.checked }))}
                      className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-300">
                    Photo du Plat (Upload ou URL) *
                  </label>

                  <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 flex items-center justify-center group">
                    {editingItem.image ? (
                      <img
                        src={editingItem.image}
                        alt="Aperçu plat"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-stone-500 text-xs flex flex-col items-center gap-1">
                        <ImageIcon className="w-8 h-8" />
                        <span>Aucune image sélectionnée</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 bg-orange-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Changer photo</span>
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCompressing ? 'Optimisation...' : 'Importer une photo'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block mb-1">Ou coller l'URL directe d'une photo :</span>
                    <input
                      type="text"
                      value={editingItem.image || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="w-full py-1.5 px-2.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer le plat</span>
                </button>
              </div>
            </div>
          )}

          {/* HOME TAB */}
          {adminTab === 'home' && (
            <div className="space-y-6">
              {/* PLAT DU JOUR ACTUEL CARD */}
              <div className="rounded-[30px] bg-[#221915] border-2 border-amber-500/40 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-amber-500/30 flex-shrink-0">
                      <img
                        src={platDuJour.image}
                        alt={platDuJour.name}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-white text-[9px] font-black uppercase tracking-wider ${
                        isPlatDuJourVisible ? 'bg-emerald-600' : 'bg-stone-700'
                      }`}>
                        {isPlatDuJourVisible ? 'EN LIGNE' : 'MASQUÉ'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                          ☼ PLAT DU JOUR ACTUEL
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-stone-300 text-[10px] font-bold">
                          {platDuJour.category}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white font-display">
                        {platDuJour.name}
                      </h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400">
                          {platDuJour.price.toLocaleString()} F CFA
                        </span>
                        {platDuJour.oldPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            {platDuJour.oldPrice.toLocaleString()} F
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-56 space-y-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (onTogglePlatDuJourVisible) onTogglePlatDuJourVisible();
                      }}
                      className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                        isPlatDuJourVisible
                          ? 'bg-[#18533B] hover:bg-[#1E6649] text-white'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                    >
                      {isPlatDuJourVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isPlatDuJourVisible ? "VISIBLE SUR L'APP" : "MASQUÉ SUR L'APP"}</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('platDuJour')}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-950/60 flex items-center justify-center gap-2"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>CHANGER LE PLAT</span>
                    </button>

                    <button
                      onClick={() => setShowPosterStudio(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#E2B124] hover:bg-[#F2BD29] text-stone-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>APERÇU PARTAGE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* REAL METRIC CARDS */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black mb-2">
                    F
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    CHIFFRE D'AFFAIRES (SESSION)
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    {totalRevenue.toLocaleString()} F
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('commandes')}
                  className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 hover:border-orange-500/40 shadow-lg cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-black mb-2">
                      👜
                    </div>
                    <span className="text-[10px] text-orange-400 font-bold uppercase">Gérer ↗</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    COMMANDES ENREGISTRÉES
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    {activeOrders.length}
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('carte')}
                  className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 hover:border-emerald-500/40 shadow-lg cursor-pointer transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black mb-2">
                    🍽️
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    PLATS DISPONIBLES
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    {availableDishesCount} / {items.length}
                  </div>
                </div>

                <div
                  onClick={() => setAdminTab('avis')}
                  className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 hover:border-amber-500/50 shadow-lg cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black mb-2">
                      ⭐
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Gérer ↗</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    AVIS GOURMETS
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-amber-400 mt-0.5 flex items-baseline gap-1.5">
                    <span>{reviews.length}</span>
                    <span className="text-xs text-stone-300">
                      • {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1) : '5.0'} / 5 ★
                    </span>
                  </div>
                </div>
              </div>

              {/* REAL SALES CHART */}
              <div className="p-5 rounded-[28px] bg-[#221B17] border border-stone-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-wider text-[#FFD700]">
                      SUIVI DES COMMANDES RÉELLES
                    </h4>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                      TOTAL PAR MOIS (EN MILLIERS DE FCFA)
                    </p>
                  </div>
                </div>

                {salesData.length > 0 ? (
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <XAxis dataKey="month" stroke="#78716C" fontSize={11} />
                        <YAxis stroke="#78716C" fontSize={11} unit="k F" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1C1917',
                            border: '1px solid #D97706',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="total" fill="#EA580C" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-stone-400 bg-stone-900/50 rounded-2xl border border-stone-800/80">
                    Aucune commande validée sur cet appareil pour le moment. Les graphiques se rempliront automatiquement dès vos premières commandes.
                  </div>
                )}
              </div>

              {/* SECURITY: MANAGER PIN CHANGE */}
              <form onSubmit={handleUpdatePin} className="p-5 rounded-[28px] bg-[#1E1713] border border-stone-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    Code PIN d'accès Gérant
                  </h4>
                </div>
                <p className="text-[11px] text-stone-400">
                  Protège l'accès à la Console Admin sur cet appareil (code par défaut : 2270).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="password"
                    inputMode="numeric"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="Nouveau PIN (min. 4 car.)"
                    className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value)}
                    placeholder="Confirmer le nouveau PIN"
                    className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider"
                  >
                    Mettre à jour le PIN
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PLAT DU JOUR TAB */}
          {adminTab === 'platDuJour' && (
            <div className="space-y-5">
              <div className="rounded-[28px] bg-gradient-to-r from-[#2A1B14] to-[#1E1410] border-2 border-amber-500/40 p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                      ☀️ PLANIFICATEUR DU PLAT DU JOUR
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white italic uppercase font-display mt-0.5">
                      Actif : {platDuJour.name} ({platDuJour.price.toLocaleString()} FCFA)
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 max-w-xl">
                      Choisissez le plat cuisiné qui apparaîtra en vedette sur l'Accueil et le Menu. L'Attiéké et le Doukounou restent exclus du statut Plat du Jour.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartEdit(platDuJour)}
                    className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier la fiche</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Sélectionner le Plat du Jour :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map(dish => {
                    const isRestricted = isRestrictedFromDailyOrFeatured(dish.name);
                    const isCurrent = dish.id === platDuJour.id;
                    return (
                      <div
                        key={dish.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-950/40 border-amber-500/80 shadow-lg'
                            : isRestricted
                            ? 'bg-stone-900/40 border-stone-800 opacity-60'
                            : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-xs truncate">{dish.name}</h5>
                            <span className="text-xs font-black text-amber-400">{dish.price.toLocaleString()} FCFA</span>
                            {isRestricted ? (
                              <span className="block text-[9px] text-stone-500 font-bold uppercase">Spécialité permanente</span>
                            ) : isCurrent ? (
                              <span className="block text-[9px] text-emerald-400 font-bold uppercase">★ Plat du Jour Actif</span>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          {isRestricted ? (
                            <span className="text-[10px] px-2 py-1 rounded bg-stone-800 text-stone-500 font-bold">
                              Exclu
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black">
                              Actif ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (onSetPlatDuJour) {
                                  onSetPlatDuJour(dish.id);
                                } else {
                                  const updated = { ...dish, isPlatDuJour: true, isFeatured: true, badge: 'Plat du Jour' };
                                  onSaveItem(updated);
                                }
                                setSuccessMsg(`${dish.name} est maintenant le Plat du Jour !`);
                                setTimeout(() => setSuccessMsg(null), 2500);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 text-xs font-bold transition-all"
                            >
                              Définir du Jour
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CARTE & PLATS TAB */}
          {adminTab === 'carte' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un plat..."
                    className="py-1.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white outline-none w-48 sm:w-64"
                  />
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="py-1.5 px-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-300 outline-none"
                  >
                    <option value="tous">Toutes ({items.length})</option>
                    {allExistingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStartAdd}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Plat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredItems.map(dish => (
                  <div
                    key={dish.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      dish.available === false
                        ? 'bg-stone-950/80 border-stone-800/60 opacity-65'
                        : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">{dish.name}</h4>
                          {dish.isFeatured && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold flex-shrink-0">
                              Accueil ⭐
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-amber-400 mt-0.5">
                          {dish.price.toLocaleString()} FCFA
                        </div>
                        <span className="text-[10px] text-stone-400 truncate block">
                          {dish.category} {dish.available === false ? '• Indisponible' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onToggleAvailability(dish.id)}
                        className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                          dish.available !== false
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-stone-800 text-stone-500'
                        }`}
                        title={dish.available !== false ? 'Disponible (cliquer pour masquer)' : 'Indisponible (cliquer pour réactiver)'}
                      >
                        {dish.available !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (isRestrictedFromDailyOrFeatured(dish.name)) {
                            setErrorMsg("L'Attiéké et le Doukounou restent commandables dans la carte normale mais ne peuvent pas être définis comme plat vedette.");
                            return;
                          }
                          onToggleFeatured(dish.id);
                        }}
                        className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                          dish.isFeatured
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isRestrictedFromDailyOrFeatured(dish.name)
                            ? 'bg-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                        title="Afficher/Retirer des incontournables"
                      >
                        ⭐
                      </button>

                      <button
                        onClick={() => handleStartEdit(dish)}
                        className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
                        title="Modifier ce plat"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                      </button>

                      {confirmDeleteItemId === dish.id ? (
                        <button
                          onClick={() => {
                            onDeleteItem(dish.id);
                            setConfirmDeleteItemId(null);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold"
                        >
                          Confirmer
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteItemId(dish.id)}
                          className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-red-400 hover:bg-red-950/30"
                          title="Supprimer ce plat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMANDES TAB */}
          {adminTab === 'commandes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Suivi & Statuts des Commandes ({orders.length})
                </h3>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-stone-900/70 border border-stone-800 text-center text-xs text-stone-400">
                  Aucune commande passée pour le moment sur cet appareil.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-[#1C1512] border border-stone-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-white">
                            Commande #{order.id} — {order.customerName}
                          </div>
                          <div className="text-xs text-stone-400">
                            {order.phone} • {order.district} ({order.address})
                          </div>
                        </div>
                        <div className="text-sm font-black text-amber-400">
                          {(order.totalAmount || 0).toLocaleString()} F CFA
                        </div>
                      </div>

                      <div className="text-xs text-stone-300 bg-stone-900/70 p-2.5 rounded-xl border border-stone-800/80">
                        {(order.items || []).map((ci, i) => (
                          <span key={i} className="inline-block mr-3">
                            <strong>{ci.quantity}x</strong> {ci.item?.name}
                          </span>
                        ))}
                      </div>

                      {onUpdateOrderStatus && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {(
                            [
                              { id: 'received', label: 'Reçue' },
                              { id: 'preparing', label: 'En préparation' },
                              { id: 'on_delivery', label: 'En route' },
                              { id: 'delivered', label: 'Livrée' },
                              { id: 'cancelled', label: 'Annulée' },
                            ] as const
                          ).map(st => (
                            <button
                              key={st.id}
                              onClick={() => onUpdateOrderStatus(order.id, st.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                order.status === st.id
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-stone-800 text-stone-400 hover:text-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AVIS DES GOURMETS TAB */}
          {adminTab === 'avis' && (
            <div className="space-y-6">
              <div className="rounded-[28px] bg-gradient-to-r from-[#2A1B14] via-[#221611] to-[#1A120E] border-2 border-amber-500/40 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
                      ⭐ GESTION DES AVIS CLIENTS
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white font-display">
                      AVIS DES GOURMETS
                    </h3>
                    <p className="text-xs text-stone-300">
                      Validez les badges « Vérifié » et modérez les témoignages publiés par vos clients.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingReview({
                        id: `rev-${Date.now()}`,
                        author: '',
                        rating: 5,
                        comment: '',
                        dishName: platDuJour.name,
                        date: "Aujourd'hui",
                        verified: true
                      });
                      setIsReviewFormOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un avis</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Total Avis
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
                      {reviews.length}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Note Moyenne
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
                        : '5.0'} ★
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Avis Vérifiés
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
                      {reviews.filter(r => r.verified).length}
                    </span>
                  </div>
                </div>
              </div>

              {isReviewFormOpen && editingReview && (
                <div className="p-5 rounded-3xl bg-[#1C1512] border-2 border-orange-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h4 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      {editingReview.author ? `Modifier l'avis de ${editingReview.author}` : "Ajouter un avis gourmet"}
                    </h4>
                    <button
                      onClick={() => {
                        setIsReviewFormOpen(false);
                        setEditingReview(null);
                      }}
                      className="p-1 rounded-lg text-stone-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                        Nom de l'auteur *
                      </label>
                      <input
                        type="text"
                        value={editingReview.author || ''}
                        onChange={e => setEditingReview({ ...editingReview, author: e.target.value })}
                        placeholder="Ex: Hadiza S., Dr. Ousmane..."
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                        Plat dégusté
                      </label>
                      <input
                        type="text"
                        value={editingReview.dishName || ''}
                        onChange={e => setEditingReview({ ...editingReview, dishName: e.target.value })}
                        placeholder="Ex: Tiep Rouge Royal..."
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                        Note
                      </label>
                      <select
                        value={editingReview.rating || 5}
                        onChange={e => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                        <option value={2}>⭐⭐ (2/5)</option>
                        <option value={1}>⭐ (1/5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                        Date affichée
                      </label>
                      <input
                        type="text"
                        value={editingReview.date || "Aujourd'hui"}
                        onChange={e => setEditingReview({ ...editingReview, date: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-300">
                        <input
                          type="checkbox"
                          checked={editingReview.verified !== false}
                          onChange={e => setEditingReview({ ...editingReview, verified: e.target.checked })}
                          className="w-4 h-4 rounded text-orange-600 bg-stone-900 border-stone-700 focus:ring-0"
                        />
                        <span className="font-bold">Badge « Vérifié »</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                      Commentaire client *
                    </label>
                    <textarea
                      rows={3}
                      value={editingReview.comment || ''}
                      onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })}
                      placeholder="Commentaire client..."
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewFormOpen(false);
                        setEditingReview(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingReview.author || !editingReview.comment) {
                          setErrorMsg("Veuillez renseigner le nom et le commentaire.");
                          return;
                        }
                        if (onSaveReview) {
                          onSaveReview({
                            id: editingReview.id || `rev-${Date.now()}`,
                            author: editingReview.author,
                            rating: editingReview.rating || 5,
                            comment: editingReview.comment,
                            dishName: editingReview.dishName,
                            date: editingReview.date || "Aujourd'hui",
                            verified: editingReview.verified !== false,
                            avatar: editingReview.avatar
                          });
                        }
                        setIsReviewFormOpen(false);
                        setEditingReview(null);
                        setSuccessMsg("Avis enregistré avec succès !");
                        setTimeout(() => setSuccessMsg(null), 3000);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                  Avis enregistrés ({reviews.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#1C1512] border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                            {rev.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-black text-white text-xs sm:text-sm truncate">
                              {rev.author}
                            </h5>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {rev.date} • {rev.dishName || 'Menu Khady'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {rev.verified && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                              ✓ Vérifié
                            </span>
                          )}
                          <div className="text-amber-400 text-xs font-bold ml-1">
                            {'★'.repeat(rev.rating || 5)}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-300 italic line-clamp-3 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
                        « {rev.comment} »
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                        <button
                          onClick={() => onToggleVerifiedReview && onToggleVerifiedReview(rev.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                            rev.verified
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-stone-900 border-stone-700 text-stone-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{rev.verified ? 'Vérifié' : 'Marquer Vérifié'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingReview({ ...rev });
                              setIsReviewFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeleteReviewId === rev.id ? (
                            <button
                              onClick={() => {
                                onDeleteReview && onDeleteReview(rev.id);
                                setConfirmDeleteReviewId(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold"
                            >
                              Supprimer
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteReviewId(rev.id)}
                              className="p-1.5 rounded-lg bg-stone-850 hover:bg-red-950/50 text-stone-400 hover:text-red-400"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* POSTER STUDIO POPUP */}
        {showPosterStudio && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1C1613] border border-amber-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-black text-white text-base">Aperçu Statut WhatsApp</h3>
              <p className="text-xs text-stone-300">
                Plat du Jour : <strong>{platDuJour.name}</strong> — {platDuJour.price.toLocaleString()} FCFA
              </p>
              <div className="rounded-xl overflow-hidden border border-stone-700 max-h-48">
                <img src={platDuJour.image} alt={platDuJour.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setShowPosterStudio(false)}
                className="w-full py-2.5 bg-amber-500 text-stone-950 font-black rounded-xl text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* SUPABASE SETTINGS & SQL MODAL */}
        <AdminSupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          currentItems={items}
          onImportItemsFromSupabase={(cloudItems) => {
            cloudItems.forEach(it => onSaveItem(it));
            setSuccessMsg(`${cloudItems.length} plats synchronisés depuis Supabase !`);
          }}
        />
      </div>
    </div>
  );
};
