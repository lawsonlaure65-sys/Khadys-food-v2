import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { Zap, Clock, Flame, ShoppingBag, MessageSquare, ArrowRight, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface HomeSpecialSectionsProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, qty: number, spice?: 'doux' | 'moyen' | 'pimenté') => void;
  onSelectItem: (item: MenuItem) => void;
  onNavigateToMenu: (filterCategory?: string) => void;
}

export const HomeSpecialSections: React.FC<HomeSpecialSectionsProps> = ({
  items,
  onAddToCart,
  onSelectItem,
  onNavigateToMenu
}) => {
  // Flash Offers tabs
  const [activeOfferIndex, setActiveOfferIndex] = useState<0 | 1>(0);

  // Live countdown timer (simulating daily flash deal expiry at midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 49, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 30, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash offers definition
  const flashOffers = [
    {
      id: 'offer-1',
      title: 'PACK DUO GRILLADES SUYA + 2 JUS BISSAP',
      subtitle: 'SPÉCIALITÉ MAISON',
      description: '2 portions de Suya tendre braisé au feu de bois avec oignons, kankankan piquant, alloco doré ou frites et 2 nectars de bissap frais.',
      oldPrice: 8500,
      price: 5500,
      discount: '-35% OFF',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      remaining: 4,
      totalStock: 20,
      linkedItemId: 'item-flash-pack-duo'
    },
    {
      id: 'offer-2',
      title: "MENU FLASH DIBI D'AGNEAU & 5 PASTELS",
      subtitle: 'DUO GOURMAND DU SAHEL',
      description: "Portion de Dibi d'Agneau tendre au feu de bois + 5 Pastels croustillants au poisson avec sauce tomate Khady + 1 Jus gingembre frais.",
      oldPrice: 7500,
      price: 5000,
      discount: '-33% OFF',
      image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      remaining: 6,
      totalStock: 25,
      linkedItemId: 'item-flash-dibi-pastels'
    }
  ];

  const currentFlash = flashOffers[activeOfferIndex];

  // Plats Signature de Khady
  const signatureDishes = items.filter(it => {
    if (!it) return false;
    const name = String(it.name || '').toLowerCase();
    const id = String(it.id || '').toLowerCase();
    return (
      id.includes('doukounou') ||
      id.includes('dibi') ||
      id.includes('box-sauces') ||
      id.includes('thieb') ||
      id.includes('yassa') ||
      id.includes('attieke') ||
      name.includes('doukounou') ||
      name.includes('signature')
    );
  }).slice(0, 6);

  // Formules Déjeuner Complet
  const dejeunerFormulas = items.filter(it => {
    if (!it) return false;
    const id = String(it.id || '').toLowerCase();
    const cat = String(it.category || '').toLowerCase();
    const name = String(it.name || '').toLowerCase();
    return cat === 'dejeuner' || id.includes('dejeuner') || name.includes('déjeuner') || name.includes('formule');
  }).slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full min-w-0">

      {/* ========================================================================= */}
      {/* 1. OFFRE FLASH DU JOUR & PROMOTION EXCLUSIVE (MATCHING SCREENSHOT 2) */}
      {/* ========================================================================= */}
      <section className="rounded-[34px] sm:rounded-[38px] bg-gradient-to-b from-[#2B1B14] via-[#1E1511] to-[#140E0B] border-2 border-amber-500/50 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Lightning Bolt, Title & -35% OFF badge */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center shadow-lg shadow-orange-950/40 flex-shrink-0 animate-pulse-subtle">
              <Zap className="w-6 h-6 fill-stone-950 text-stone-950" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black italic uppercase tracking-wider text-[#FFD700] block">
                PROMOTION EXCLUSIVE
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white font-display leading-tight">
                OFFRE FLASH <span className="text-orange-500">DU JOUR</span>
              </h2>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#E50914] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-red-950/50 animate-bounce">
            {currentFlash.discount}
          </span>
        </div>

        {/* Real-time Countdown Timer (as in Screenshot 2) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 relative z-10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>

          {/* Hours Box */}
          <div className="w-14 sm:w-16 py-1.5 sm:py-2 rounded-2xl bg-[#38261E] border border-amber-500/30 text-center shadow">
            <div className="text-base sm:text-xl font-black text-amber-300 font-mono leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 tracking-wider mt-0.5">
              HRS
            </div>
          </div>

          <span className="text-amber-500 font-black text-lg">:</span>

          {/* Minutes Box */}
          <div className="w-14 sm:w-16 py-1.5 sm:py-2 rounded-2xl bg-[#38261E] border border-amber-500/30 text-center shadow">
            <div className="text-base sm:text-xl font-black text-amber-300 font-mono leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 tracking-wider mt-0.5">
              MIN
            </div>
          </div>

          <span className="text-amber-500 font-black text-lg">:</span>

          {/* Seconds Box */}
          <div className="w-14 sm:w-16 py-1.5 sm:py-2 rounded-2xl bg-[#38261E] border border-amber-500/30 text-center shadow">
            <div className="text-base sm:text-xl font-black text-orange-400 font-mono leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 tracking-wider mt-0.5">
              SEC
            </div>
          </div>
        </div>

        {/* Big Product Image with STOCK LIMITÉ and Price Tag Overlay */}
        <div className="relative rounded-[28px] overflow-hidden border border-amber-500/40 aspect-[16/10] sm:aspect-[21/10] bg-stone-900 shadow-xl group">
          <img
            src={currentFlash.image}
            alt={currentFlash.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

          {/* Badge Stock Limité top-left */}
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              STOCK LIMITÉ
            </span>
          </div>

          {/* Price Overlay Tag bottom-right */}
          <div className="absolute bottom-3.5 right-3.5 p-2 sm:p-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-right shadow-2xl">
            <div className="text-[11px] sm:text-xs text-stone-400 line-through font-mono font-bold">
              {currentFlash.oldPrice.toLocaleString()} F
            </div>
            <div className="text-lg sm:text-2xl font-black text-[#FFD700] font-display">
              {currentFlash.price.toLocaleString()} F CFA
            </div>
          </div>
        </div>

        {/* Toggle Pills: OFFRE #1 / OFFRE #2 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setActiveOfferIndex(0)}
            className={`py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md ${
              activeOfferIndex === 0
                ? 'bg-[#FFD700] text-stone-950 shadow-amber-500/30 scale-[1.01]'
                : 'bg-[#2A201A] hover:bg-[#342821] text-stone-300 border border-stone-800'
            }`}
          >
            OFFRE #1
          </button>
          <button
            onClick={() => setActiveOfferIndex(1)}
            className={`py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md ${
              activeOfferIndex === 1
                ? 'bg-[#FFD700] text-stone-950 shadow-amber-500/30 scale-[1.01]'
                : 'bg-[#2A201A] hover:bg-[#342821] text-stone-300 border border-stone-800'
            }`}
          >
            OFFRE #2
          </button>
        </div>

        {/* Product Details & Action Buttons */}
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-400 block">
              {currentFlash.subtitle}
            </span>
            <h3 className="text-lg sm:text-2xl font-black italic uppercase text-white font-display mt-0.5">
              {currentFlash.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
              {currentFlash.description}
            </p>
          </div>

          {/* Stock remaining indicator bar */}
          <div className="p-2.5 rounded-xl bg-[#231813] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              <span>Quantité restante : {currentFlash.remaining} / {currentFlash.totalStock} portions aujourd'hui</span>
            </span>
            <div className="w-full sm:w-36 h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                style={{ width: `${(currentFlash.remaining / currentFlash.totalStock) * 100}%` }}
              />
            </div>
          </div>

          {/* Action buttons: Add to Cart & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                const targetItem = items.find(i => i.id === currentFlash.linkedItemId) || items[0];
                if (targetItem) {
                  onAddToCart(targetItem, 1, 'moyen');
                }
              }}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>AJOUTER AU PANIER ({currentFlash.price.toLocaleString()} F)</span>
            </button>

            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=Bonjour%20Khady%27s%20Food%2C%20je%20profite%20de%20l%27${encodeURIComponent(currentFlash.title)}%20en%20Promotion%20Flash%20%C3%A0%20${currentFlash.price}%20FCFA%20!`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 transition-all text-center"
            >
              <MessageSquare className="w-4 h-4" />
              <span>COMMANDER SUR WHATSAPP</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LES PLATS SIGNATURE DE KHADY (ICÔNES CULINAIRES DE LA MAISON) */}
      {/* ========================================================================= */}
      <section className="rounded-[34px] sm:rounded-[38px] bg-gradient-to-b from-[#231812] via-[#1B130F] to-[#140E0B] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow">
                ⭐ L'ART DE KHADY
              </span>
              <span className="text-xs font-bold text-amber-300">Recettes Authentiques</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black italic uppercase text-white font-display mt-1.5">
              LES PLATS SIGNATURE <span className="text-[#FFD700]">DE KHADY</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Les incontournables emblématiques qui ont bâti la légende gourmande de Khady's Food à Niamey : le Doukounou vapeur, le Dibi grillé au feu de bois et nos fameuses box sauces artisanales.
            </p>
          </div>

          <button
            onClick={() => onNavigateToMenu('signature')}
            className="text-xs sm:text-sm font-black italic uppercase text-orange-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-end"
          >
            <span>TOUT LE MENU SIGNATURE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Signature Dishes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {signatureDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectItem(dish)}
              className="rounded-3xl bg-[#1C1512] hover:bg-[#231A16] border border-amber-500/30 p-3.5 sm:p-4 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                    {dish.badge || 'Signature'}
                  </span>
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-orange-600/90 text-white font-black text-xs shadow-md">
                    {dish.price.toLocaleString()} F CFA
                  </div>
                </div>

                <div>
                  <h4 className="font-black italic uppercase text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                    {dish.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {dish.preparationTime || '20 min'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(dish, 1, 'moyen');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition-transform"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Panier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LES FORMULES "DÉJEUNER COMPLET" DU MIDI */}
      {/* ========================================================================= */}
      <section className="rounded-[34px] sm:rounded-[38px] bg-gradient-to-b from-[#1E1915] via-[#17120E] to-[#110D0A] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E2B124] text-stone-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow">
                ☀️ FORMULES DU MIDI (11H30 - 15H00)
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Repas Équilibré & Rapide
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black italic uppercase text-white font-display mt-1.5">
              LES "DÉJEUNER COMPLET" <span className="text-[#FFD700]">DU SAHEL</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Votre formule tout-en-un pour la pause déjeuner : une entrée croustillante, un grand plat chaud mijoté ou grillé, et une boisson naturelle glacée.
            </p>
          </div>

          <button
            onClick={() => onNavigateToMenu('dejeuner')}
            className="text-xs sm:text-sm font-black italic uppercase text-orange-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-end"
          >
            <span>VOIR LES FORMULES MIDI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards of Déjeuner Complet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {dejeunerFormulas.map((formula) => (
            <div
              key={formula.id}
              onClick={() => onSelectItem(formula)}
              className="rounded-3xl bg-[#1C1613] hover:bg-[#241B17] border border-amber-500/30 p-4 space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-900">
                  <img
                    src={formula.image}
                    alt={formula.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                    🍱 Entrée + Plat + Boisson
                  </div>
                  {formula.oldPrice && (
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/85 text-amber-300 font-bold text-xs border border-amber-500/30">
                      <span className="line-through text-stone-400 text-[10px] mr-1">{formula.oldPrice.toLocaleString()} F</span>
                      <span className="text-[#FFD700] font-black">{formula.price.toLocaleString()} F</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-black italic uppercase text-white text-sm sm:text-base">
                    {formula.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-1 leading-relaxed">
                    {formula.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 block">
                    Composition du Menu Déjeuner :
                  </span>
                  <div className="text-[10px] text-stone-300 space-y-0.5">
                    <div>🥗 <span className="font-semibold text-white">Entrée :</span> 4 Pastels ou Alloco doré</div>
                    <div>🍲 <span className="font-semibold text-white">Plat :</span> Cuisiné frais du jour au choix</div>
                    <div>🍹 <span className="font-semibold text-white">Boisson :</span> Jus de Bissap ou Gingembre 50cl</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-amber-400">
                  {formula.price.toLocaleString()} F CFA
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(formula, 1, 'moyen');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow active:scale-95 transition-transform"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commander</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
