import React from 'react';
import { KhadyOriginalLogo } from './KhadyOriginalLogo';
import {
  Mic, Bell, Sun, User, Home, BookOpen, Image as ImageIcon,
  Video, MessageSquare, ShoppingBag, ArrowRight, Flame
} from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenVoice: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  cartCount,
  onOpenCart,
  onOpenVoice,
  onOpenNotifications,
  onOpenProfile
}) => {
  return (
    <>
      {/* 1. TOP TICKER BANNER (As in Screenshot 2) */}
      <div className="w-full bg-gradient-to-r from-[#FF5500] via-[#FF8800] to-[#FFAA00] py-2 px-3 sm:px-6 text-white flex items-center justify-between shadow-md text-xs sm:text-sm font-semibold select-none z-40 relative">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-[#D83C00] text-white font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1 flex-shrink-0">
            VENTE FLASH 🔥
          </span>
          <span className="truncate font-bold text-white drop-shadow-sm">
            Offre Spéciale du Jour : Dibi d'Agneau & Pastels Frais
          </span>
        </div>

        <button
          onClick={() => onTabChange('carte')}
          className="ml-2 px-3 py-1 bg-white text-stone-950 font-black text-[11px] sm:text-xs rounded-full shadow hover:bg-stone-100 flex items-center gap-1 flex-shrink-0 transition-transform active:scale-95"
        >
          <span>COMMANDER</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. MAIN HEADER (As in Screenshot 2) */}
      <header className="sticky top-0 z-30 bg-[#121110]/95 backdrop-blur-md border-b border-stone-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div
            onClick={() => onTabChange('accueil')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* White Squircle Avatar with Khady's Food original logo + green dot */}
            <div className="relative flex-shrink-0">
              <KhadyOriginalLogo
                size={46}
                withSquircle={true}
                className="shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121110] shadow-sm animate-pulse" />
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-black text-amber-500 tracking-wider flex items-center gap-1">
                👋 SALAM 👋
              </span>
              <span className="font-display italic font-black text-amber-400 text-xs sm:text-sm tracking-wide group-hover:text-amber-300 transition-colors">
                KHADY'S FOOD & EVENT
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons (Mic, Bell, Sun, User) */}
          <div className="flex items-center gap-2">
            {/* 1. Voice Order (Orange) */}
            <button
              onClick={onOpenVoice}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-950/40 transition-transform active:scale-95"
              title="Commande vocale"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 2. Notifications (Yellow) */}
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-md shadow-amber-950/40 transition-transform active:scale-95"
              title="Notifications push & suivi PWA"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 3. Theme / Sun (Dark) */}
            <button
              onClick={() => {}}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-850 hover:bg-stone-800 text-amber-400 flex items-center justify-center border border-stone-800 transition-transform active:scale-95"
              title="Mode Gourmand"
            >
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 4. Profile / Moi (Dark) */}
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white flex items-center justify-center border border-stone-800 transition-transform active:scale-95"
              title="Mon compte & Espace Gérant"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. FIXED BOTTOM NAVIGATION BAR (Exact replica of Screenshot 2) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161413]/95 backdrop-blur-xl border-t border-stone-800/90 py-1.5 px-1 sm:px-6 shadow-2xl">
        <div className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto flex items-center justify-around">
          {/* 1. ACCUEIL */}
          <button
            onClick={() => onTabChange('accueil')}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                currentTab === 'accueil'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                currentTab === 'accueil' ? 'text-orange-500' : 'text-stone-400'
              }`}
            >
              Accueil
            </span>
          </button>

          {/* 2. MENU */}
          <button
            onClick={() => onTabChange('carte')}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                currentTab === 'carte'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                currentTab === 'carte' ? 'text-orange-500' : 'text-stone-400'
              }`}
            >
              Menu
            </span>
          </button>

          {/* 3. GALERIE */}
          <button
            onClick={() => onTabChange('galerie')}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                currentTab === 'galerie'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                currentTab === 'galerie' ? 'text-orange-500' : 'text-stone-400'
              }`}
            >
              Galerie
            </span>
          </button>

          {/* 4. DÉMO 4K */}
          <button
            onClick={() => onTabChange('demo4k')}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                currentTab === 'demo4k'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Video className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                currentTab === 'demo4k' ? 'text-orange-500' : 'text-stone-400'
              }`}
            >
              Démo 4K
            </span>
          </button>

          {/* 5. WHATSAPP */}
          <a
            href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=Bonjour%20Khady%27s%20Food%20%26%20Event%2C%20je%20souhaite%20commander%20!`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-400 hover:text-emerald-400 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 hover:text-emerald-400">
              WhatsApp
            </span>
          </a>

          {/* 6. PANIER */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none relative"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-400 hover:text-orange-400 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 hover:text-orange-400">
              Panier
            </span>
          </button>

          {/* 7. MOI */}
          <button
            onClick={onOpenProfile}
            className="flex flex-col items-center gap-1 py-1 px-2 transition-colors select-none"
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 hover:text-white">
              Moi
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
