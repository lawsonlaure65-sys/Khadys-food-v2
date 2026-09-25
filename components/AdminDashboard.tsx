import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Order } from '../types';
import {
  Plus, Edit3, Trash2, CheckCircle, X, Upload, Sparkles, Star, AlertCircle,
  Clock, DollarSign, Image as ImageIcon, Flame, RotateCcw, Save, Eye, TrendingUp,
  LayoutGrid, Sun, Utensils, BookOpen, Monitor, Power, Check, ArrowRight, Share2
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { saveAdminDraft, loadAdminDraft } from '../utils/offlineDB';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { isRestrictedFromDailyOrFeatured } from '../constants';

interface AdminProps {
  items: MenuItem[];
  onSaveItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  orders: Order[];
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onToggleFeatured,
  orders,
  onClose
}) => {
  const [adminTab, setAdminTab] = useState<'home' | 'platDuJour' | 'carte' | 'blog'>('home');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPlatDuJourVisible, setIsPlatDuJourVisible] = useState(true);
  const [showPosterStudio, setShowPosterStudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sales data for monthly chart
  const salesData = [
    { month: 'Mai', total: 2450 },
    { month: 'Juin', total: 2890 },
    { month: 'Juil', total: 3100 },
    { month: 'Août', total: 3280 },
    { month: 'Sept', total: 3455 }
  ];

  // Sélection du plat du jour : exclure strictement le Doukounou et l'Attiéké
  const platDuJour = items.find(i => i.isFeatured && !isRestrictedFromDailyOrFeatured(i.name)) ||
                     items.find(i => !isRestrictedFromDailyOrFeatured(i.name)) ||
                     items[0];

  const handleStartAdd = () => {
    const fresh: Partial<MenuItem> = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      price: 3500,
      category: 'plats',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      isFeatured: true, // Crucial: default to true so it appears immediately in the Incontournables rectangles!
      badge: 'Nouveau plat',
      preparationTime: '20 min',
      spicyLevel: 1,
      ingredients: ['Ingrédients frais', 'Épices de Niamey'],
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
      category: editingItem.category || 'plats',
      image: editingItem.image.trim(),
      isPopular: editingItem.isPopular ?? true,
      isFeatured: isRestricted ? false : (editingItem.isFeatured ?? true),
      badge: editingItem.badge || (isRestricted ? 'Spécialité Permanente' : 'Nouveau'),
      preparationTime: editingItem.preparationTime || '20 min',
      spicyLevel: editingItem.spicyLevel || 1,
      ingredients: editingItem.ingredients || ['Spécialité Khady'],
      available: editingItem.available ?? true,
      createdAt: editingItem.createdAt || new Date().toISOString()
    };

    onSaveItem(itemToSave);
    saveAdminDraft(null);
    setSuccessMsg(
      isRestricted
        ? `Plat "${itemToSave.name}" enregistré dans la carte permanente ! (Réservé hors plat vedette/jour selon les règles)`
        : `Plat "${itemToSave.name}" enregistré et visible dans les rectangles de l'accueil !`
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

  const filteredItems = items.filter(it => {
    const matchCat = filterCategory === 'tous' || it.category === filterCategory;
    const matchQuery = !searchQuery || it.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#17120F] border-2 border-amber-500/40 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-[#F7F4EE]"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. TOP TABS (As in Screenshot 8: HOME, PLAT DU JOUR, CARTE, BLOG) */}
        <div className="px-4 py-3 bg-[#110D0B] border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('home')}
              className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                adminTab === 'home'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => setAdminTab('platDuJour')}
              className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
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
              className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                adminTab === 'carte'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>CARTE & PLATS</span>
            </button>

            <button
              onClick={() => setAdminTab('blog')}
              className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                adminTab === 'blog'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>BLOG</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. CONSOLE ADMIN ELITE HEADER (As in Screenshot 8) */}
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
              title="Ajouter un plat au clavier"
            >
              <Plus className="w-4 h-4 text-orange-400" />
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CLOUD ●</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-900 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-950/40"
              title="Quitter la console"
            >
              <Power className="w-4 h-4" />
            </button>

            {/* Avatar Photo of Khady */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
                alt="Chef Khady"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Notifications */}
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

          {/* EDIT / CREATE DISH MODAL OR DRAWER */}
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
                {/* Left column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Nom du Plat *</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: LE FAMEUX DOUKOUNOU DE KHADY"
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
                        value={editingItem.category || 'plats'}
                        onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                      >
                        <option value="plats">Plats Cuisinés</option>
                        <option value="grillades">Grillades & Dibi</option>
                        <option value="entrees">Entrées & Pastels</option>
                        <option value="sauces">Box Sauces</option>
                        <option value="boissons">Boissons & Jus</option>
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

                  {/* CRITICAL CHECKBOX: Visible on Home Incontournables rectangles */}
                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        Afficher dans les Rectangles de l'Accueil ⭐
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Visible en premier sur la page d'accueil sous "Incontournables"
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

                {/* Right column: Image upload & preview */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-300">
                    Photo du Plat (Upload depuis l'appareil ou URL) *
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
                      <span>{isCompressing ? 'Optimisation...' : 'Importer photo propre'}</span>
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

              {/* Action buttons */}
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
                  <span>Enregistrer dans les Rectangles</span>
                </button>
              </div>
            </div>
          )}

          {/* HOME TAB: Exactly matches Screenshot 8 */}
          {adminTab === 'home' && (
            <div className="space-y-6">
              {/* PLAT DU JOUR ACTUEL CARD (Screenshot 8) */}
              <div className="rounded-[30px] bg-[#221915] border-2 border-amber-500/40 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Food thumbnail with EN LIGNE badge */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-amber-500/30 flex-shrink-0">
                      <img
                        src={platDuJour.image}
                        alt={platDuJour.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                        EN LIGNE
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                          ☼ PLAT DU JOUR ACTUEL
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-stone-300 text-[10px] font-bold">
                          Demain Jeudi Midi
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white font-display">
                        {platDuJour.name}
                      </h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400">
                          {platDuJour.price.toLocaleString()} F CFA
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          {(platDuJour.price + 550).toLocaleString()} F
                        </span>
                        <span className="text-xs text-stone-400">• 25 parts</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Action Buttons (Screenshot 8) */}
                  <div className="w-full sm:w-56 space-y-2 flex-shrink-0">
                    <button
                      onClick={() => setIsPlatDuJourVisible(!isPlatDuJourVisible)}
                      className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                        isPlatDuJourVisible
                          ? 'bg-[#18533B] hover:bg-[#1E6649] text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VISIBLE SUR L'APP</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(platDuJour)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-950/60 flex items-center justify-center gap-2"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>CHANGER / CRÉER</span>
                    </button>

                    <button
                      onClick={() => setShowPosterStudio(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#E2B124] hover:bg-[#F2BD29] text-stone-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>STUDIO AFFICHE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 METRIC CARDS (2x2 Grid from Screenshot 8) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* 1. VENTES DU MOIS */}
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black mb-2">
                    $
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    VENTES DU MOIS
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    3 455,5k F
                  </div>
                </div>

                {/* 2. COMMANDES VALIDÉES */}
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-black mb-2">
                    👜
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    COMMANDES VALIDÉES
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    1736
                  </div>
                </div>

                {/* 3. LIVREURS LIVE */}
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black mb-2">
                    🚲
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    LIVREURS LIVE
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    4 Actifs
                  </div>
                </div>

                {/* 4. ARTICLES BLOG */}
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#221B17] border border-stone-800 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-black mb-2">
                    📖
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
                    ARTICLES BLOG
                  </span>
                  <div className="text-xl sm:text-2xl font-black italic text-white mt-0.5">
                    3
                  </div>
                </div>
              </div>

              {/* MONTHLY SALES CHART (Screenshot 8) */}
              <div className="p-5 rounded-[28px] bg-[#221B17] border border-stone-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-wider text-[#FFD700]">
                      GRAPHIQUE DES VENTES MENSUELLES
                    </h4>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                      VISUALISATION DES REVENUS GÉNÉRÉS PAR KHADY'S FOOD
                    </p>
                  </div>
                </div>

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
              </div>
            </div>
          )}

          {/* PLAT DU JOUR DEDICATED TAB */}
          {adminTab === 'platDuJour' && (
            <div className="space-y-5">
              <div className="rounded-[28px] bg-gradient-to-r from-[#2A1B14] to-[#1E1410] border-2 border-amber-500/40 p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                      ☀️ PLANIFICATEUR DU PLAT DU JOUR
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white italic uppercase font-display mt-0.5">
                      Actuellement programmé : {platDuJour.name} ({platDuJour.price.toLocaleString()} FCFA)
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 max-w-xl">
                      Sélectionnez ci-dessous le plat cuisiné qui apparaîtra en vedette aujourd'hui sur l'Accueil et le Menu.
                      Note : L'Attiéké et le Doukounou sont des spécialités permanentes et ne peuvent pas être programmés comme plat du jour.
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
                  Choisir le plat du jour parmi les plats éligibles :
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
                              <span className="block text-[9px] text-stone-500 font-bold uppercase">Spécialité permanente (non éligible)</span>
                            ) : isCurrent ? (
                              <span className="block text-[9px] text-emerald-400 font-bold uppercase">★ Plat du Jour Actif</span>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          {isRestricted ? (
                            <span className="text-[10px] px-2 py-1 rounded bg-stone-800 text-stone-500 font-bold">
                              Verrouillé
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black">
                              En ligne ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                // Set this item as badge "Menu du Jour" and isFeatured true, update others
                                const updated = { ...dish, isFeatured: true, badge: 'Menu du Jour' };
                                onSaveItem(updated);
                                setSuccessMsg(`${dish.name} est maintenant le Plat du Jour !`);
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
                    <option value="tous">Toutes les catégories</option>
                    <option value="plats">Plats</option>
                    <option value="grillades">Grillades</option>
                    <option value="entrees">Entrées</option>
                    <option value="sauces">Sauces</option>
                  </select>
                </div>

                <button
                  onClick={handleStartAdd}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Plat avec Photo</span>
                </button>
              </div>

              {/* Dish List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredItems.map(dish => (
                  <div
                    key={dish.id}
                    className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-colors"
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
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              Accueil ⭐
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-amber-400 mt-0.5">
                          {dish.price.toLocaleString()} FCFA
                        </div>
                        <span className="text-[10px] text-stone-400 truncate block">
                          {dish.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (isRestrictedFromDailyOrFeatured(dish.name)) {
                            setErrorMsg("L'Attiéké et le Doukounou restent commandables dans la carte normale mais ne peuvent pas être définis comme plat vedette ou plat du jour.");
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
                        title={
                          isRestrictedFromDailyOrFeatured(dish.name)
                            ? "Plat réservé à la carte permanente (interdit comme plat vedette / plat du jour)"
                            : "Afficher/Retirer des rectangles de l'accueil"
                        }
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

                      <button
                        onClick={() => onDeleteItem(dish.id)}
                        className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-red-400 hover:bg-red-950/30"
                        title="Supprimer ce plat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOG TAB */}
          {adminTab === 'blog' && (
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Gestion des Articles du Blog</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                3 articles sont actuellement publiés et accessibles aux clients depuis la page d'accueil.
              </p>
            </div>
          )}
        </div>

        {/* POSTER STUDIO POPUP */}
        {showPosterStudio && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1C1613] border border-amber-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-black text-white text-base">Studio Affiche WhatsApp</h3>
              <p className="text-xs text-stone-300">
                Affiche générée pour le {platDuJour.name} au tarif de {platDuJour.price.toLocaleString()} FCFA prête à être partagée !
              </p>
              <div className="rounded-xl overflow-hidden border border-stone-700 max-h-48">
                <img src={platDuJour.image} alt={platDuJour.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setShowPosterStudio(false)}
                className="w-full py-2.5 bg-amber-500 text-stone-950 font-black rounded-xl text-xs"
              >
                Fermer le Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
