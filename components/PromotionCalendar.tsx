import React, { useState } from 'react';
import { Calendar, Tag, Clock, Sparkles, ShoppingBag, Gift, ChevronRight, Zap, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { MenuItem } from '../types';
import { playSound } from '../utils/audio';

export interface DailyPromo {
  id: string;
  dayName: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  title: string;
  badge: string;
  discountTag: string;
  description: string;
  itemPrice?: number;
  promoPrice?: number;
  image: string;
  code: string;
  category: string;
  popularDishName?: string;
  isToday?: boolean;
}

export const WEEKLY_PROMOTIONS: DailyPromo[] = [
  {
    id: 'promo-mon',
    dayName: 'Lundi',
    dayIndex: 1,
    title: 'Lundi Sauces & Saveurs',
    badge: 'DEBUT DE SEMAINE',
    discountTag: '-20% sur Box Sauces',
    description: 'Bénéficiez de 20% de réduction sur toutes nos Box Sauces Authentiques (Mafé, Gombo, Feuille) livrées chaudes !',
    itemPrice: 3500,
    promoPrice: 2800,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    code: 'LUNDISAuce',
    category: 'Box Sauces',
    popularDishName: 'Box Sauce Mafé Royale'
  },
  {
    id: 'promo-tue',
    dayName: 'Mardi',
    dayIndex: 2,
    title: 'Mardi Tchep & Grillades',
    badge: 'BOOSTER GOURMAND',
    discountTag: 'Boisson Bissap Offerte',
    description: 'Une grande bouteille de Bissap glacé 100% naturel offerte pour tout menu Tchep ou Poulet Braisé commandé.',
    itemPrice: 4000,
    promoPrice: 4000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    code: 'BISSAPFREE',
    category: 'Plats Chauds',
    popularDishName: 'Tchep au Poulet Yassa'
  },
  {
    id: 'promo-wed',
    dayName: 'Mercredi',
    dayIndex: 3,
    title: 'Mercredi Buffet & Entreprise',
    badge: 'LUNCH EXPRESS',
    discountTag: '-15% Buffet Pro',
    description: 'Livraison gratuite et 15% de remise pour vos réunions et repas d’équipe au bureau à Niamey.',
    itemPrice: 7500,
    promoPrice: 6375,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    code: 'BUFFETPRO15',
    category: 'Buffet Pro',
    popularDishName: 'Pack Buffet Prestige (10 Pers.)'
  },
  {
    id: 'promo-thu',
    dayName: 'Jeudi',
    dayIndex: 4,
    title: 'Jeudi Dégustation Dibi',
    badge: 'SPÉCIALITÉ CHEF',
    discountTag: '1 Portation Dibi d’Agneau Offerte',
    description: 'Pour toute commande de plus de 15.000 F, recevez une portion supplémentaire de Dibi d’Agneau Braisé au feu de bois.',
    itemPrice: 5000,
    promoPrice: 3800,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    code: 'DIBIGOLD',
    category: 'Grillades',
    popularDishName: 'Dibi d’Agneau Grillé & Aloko'
  },
  {
    id: 'promo-fri',
    dayName: 'Vendredi',
    dayIndex: 5,
    title: 'Vendredi Couscous & Festin',
    badge: 'VENDREDI BENI',
    discountTag: 'Dessert Glacé & Thé Offerts',
    description: 'Le traditionnel Couscous Royal accompagné d’un thé à la menthe chaud et d’une verrine douceur offerte.',
    itemPrice: 4500,
    promoPrice: 4500,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
    code: 'COUSCOUSVIP',
    category: 'Plats Traditionnels',
    popularDishName: 'Couscous Royal 7 Légumes'
  },
  {
    id: 'promo-sat',
    dayName: 'Samedi',
    dayIndex: 6,
    title: 'Samedi Family & Traiteur',
    badge: 'WEEK-END FESTIF',
    discountTag: 'Livraison Gratuite Niamey',
    description: 'Frais de livraison Billo Express entièrement offerts pour toute la famille sur toutes les commandes du Samedi.',
    itemPrice: 10000,
    promoPrice: 8500,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    code: 'LIVRAISONFREE',
    category: 'Pack Famille',
    popularDishName: 'Mega Pack Grillades Mixte'
  },
  {
    id: 'promo-sun',
    dayName: 'Dimanche',
    dayIndex: 0,
    title: 'Dimanche Brunch & Relaxation',
    badge: 'DETENTE & DOUCEUR',
    discountTag: 'Double Points Fidélité',
    description: 'Cumulez 2x plus de points Club Gold sur toutes vos commandes du dimanche midi et soir !',
    itemPrice: 5000,
    promoPrice: 4500,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600',
    code: 'DOUBLEPOINTS',
    category: 'Brunch',
    popularDishName: 'Brunch Royal Niamey'
  }
];

interface PromotionCalendarProps {
  onSelectOffer?: (promo: DailyPromo) => void;
  onGoToMenu?: () => void;
}

export const PromotionCalendar: React.FC<PromotionCalendarProps> = ({ onSelectOffer, onGoToMenu }) => {
  const currentDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(currentDayIndex);
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);

  const activePromo = WEEKLY_PROMOTIONS.find(p => p.dayIndex === selectedDayIndex) || WEEKLY_PROMOTIONS[0];
  const isTodayPromo = selectedDayIndex === currentDayIndex;

  const handleClaimCode = (code: string) => {
    playSound('cash');
    if (!claimedCodes.includes(code)) {
      setClaimedCodes([...claimedCodes, code]);
    }
    if (onSelectOffer) {
      onSelectOffer(activePromo);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1A0F0D] via-[#2A1713] to-[#1A0F0D] text-white rounded-[2.8rem] p-6 sm:p-8 shadow-2xl border-2 border-brand-gold/30 relative overflow-hidden my-6">
      {/* Background Decor Texture */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/40 shadow-inner">
              <Calendar size={18} />
            </div>
            <span className="text-[9px] font-black uppercase text-brand-gold tracking-[0.3em] italic">
              OFFRES SPÉCIALES & BONUS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white">
            Calendrier des <span className="text-brand-gold">Promos de la Semaine</span>
          </h2>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mt-1">
            Chaque jour une spécialité exclusive au meilleur prix à Niamey
          </p>
        </div>

        {/* Live Today Badge */}
        <div className="flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 text-brand-orange px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider shrink-0 shadow-lg">
          <Flame size={14} className="animate-bounce text-brand-orange" />
          <span>Offre Aujourd'hui Active</span>
        </div>
      </div>

      {/* Days Tabs Bar */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {WEEKLY_PROMOTIONS.map((promo) => {
          const isSelected = promo.dayIndex === selectedDayIndex;
          const isToday = promo.dayIndex === currentDayIndex;

          return (
            <button
              key={promo.id}
              onClick={() => {
                playSound('pop');
                setSelectedDayIndex(promo.dayIndex);
              }}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl text-center transition-all duration-300 flex flex-col items-center gap-1 border ${
                isSelected
                  ? 'bg-brand-gold text-brand-brown border-brand-gold shadow-xl scale-105 font-black'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black uppercase italic tracking-tight">{promo.dayName}</span>
                {isToday && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-brown' : 'bg-brand-orange animate-ping'}`}></span>
                )}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? 'text-brand-brown/80' : 'text-brand-gold'}`}>
                {promo.discountTag.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Featured Promo Display Card */}
      <div className="relative z-10 bg-white/5 rounded-[2.2rem] p-5 sm:p-7 border border-white/15 backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Promo Image & Badge */}
        <div className="md:col-span-5 relative group overflow-hidden rounded-[1.8rem] shadow-2xl h-52 md:h-64 border border-white/10">
          <img
            src={activePromo.image}
            alt={activePromo.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

          {/* Top Tag */}
          <div className="absolute top-3 left-3 bg-brand-orange text-white text-[8px] font-black uppercase italic tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-white/20">
            {activePromo.badge}
          </div>

          {isTodayPromo && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 animate-pulse">
              <Sparkles size={12} /> Valide Aujourd'hui
            </div>
          )}

          {/* Bottom Title overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[9px] text-brand-gold font-bold uppercase tracking-widest block">
              {activePromo.category}
            </span>
            <h4 className="text-lg font-black text-white italic uppercase tracking-tight truncate">
              {activePromo.popularDishName}
            </h4>
          </div>
        </div>

        {/* Promo Content Details */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold bg-brand-gold/15 px-3 py-1 rounded-full border border-brand-gold/30">
              {activePromo.dayName} • Code: {activePromo.code}
            </span>

            {activePromo.promoPrice && activePromo.itemPrice && (
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                <span className="text-xs text-white/50 line-through font-bold">{activePromo.itemPrice} F</span>
                <span className="text-sm font-black text-brand-gold">{activePromo.promoPrice} F CFA</span>
              </div>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase italic text-white tracking-tight leading-snug">
            {activePromo.title}
          </h3>

          <p className="text-xs font-bold text-white/80 leading-relaxed">
            {activePromo.description}
          </p>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-black">
                <Tag size={20} />
              </div>
              <div>
                <span className="text-[8px] uppercase font-bold text-white/50 tracking-wider block">Avantage du Jour</span>
                <span className="text-xs font-black uppercase italic text-brand-gold">{activePromo.discountTag}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] uppercase font-bold text-white/50 tracking-wider block">Statut</span>
              <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1 justify-end">
                <CheckCircle2 size={12} /> {isTodayPromo ? 'Disponible' : 'À venir'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleClaimCode(activePromo.code)}
              className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] italic tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                claimedCodes.includes(activePromo.code)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-gold text-brand-brown hover:bg-yellow-400'
              }`}
            >
              {claimedCodes.includes(activePromo.code) ? (
                <>
                  <CheckCircle2 size={16} /> Code Promo Appliqué !
                </>
              ) : (
                <>
                  <Gift size={16} /> Profiter de l'offre ({activePromo.code})
                </>
              )}
            </button>

            {onGoToMenu && (
              <button
                onClick={() => {
                  playSound('pop');
                  onGoToMenu();
                }}
                className="w-full sm:w-auto py-4 px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[10px] italic tracking-wider flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all"
              >
                Voir le Menu <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCalendar;
