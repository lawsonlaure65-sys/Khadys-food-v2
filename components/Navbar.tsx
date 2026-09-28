import React from 'react';
import { KhadyOriginalLogo } from './KhadyOriginalLogo';
import {
  Mic, Bell, Sun, User, Home, BookOpen, Image as ImageIcon,
  Video, MessageSquare, ShoppingBag, ArrowRight, Flame, ClipboardList, Newspaper
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
  onOpenBlog?: () => void;
}

const GREETINGS = [
  { text: 'Bonjour !', lang: 'Français' },
  { text: 'Barka !', lang: 'Haoussa' },
  { text: 'Fofo !', lang: 'Zarma' },
  { text: 'Salam !', lang: 'Paix' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  cartCount,
  onOpenCart,
  onOpenVoice,
  onOpenNotifications,
  onOpenProfile,
  onOpenBlog
}) => {
  const [greetingIndex, setGreetingIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* 1. TOP TICKER BANNER (As in Screenshot 2) */}
      <div className="w-full bg-gradient-to-r from-[#FF5500] via-[#FF8800] to-[#FFAA00] py-2 px-3 sm:px-6 text-white flex items-center justify-between shadow-md text-xs sm:text-sm font-semibold select-none z-40 relative">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-[#D83C00] text-white font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1 flex-shrink-0">
            VENTE FLASH 🔥
          </span>
          <span className="truncate font-bold text-white drop-shadow-sm flex items-center gap-1.5">
            <span className="animate-wave inline-block text-xs">👋🏾</span>
            <span className="font-black text-amber-100">Bonjour, Barka, Fofo !</span>
            <span className="hidden xs:inline text-white/95">• Dibi d'Agneau, Tiep & Pastels Frais</span>
            <span className="animate-wave-alt inline-block text-xs">👋🏾</span>
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
              <span className="text-[10px] sm:text-[11px] font-black text-amber-400 tracking-wider flex items-center gap-1 select-none">
                <span className="animate-wave text-xs sm:text-sm inline-block">👋🏾</span>
                <span className="inline-block transition-all duration-300 font-extrabold uppercase tracking-widest text-amber-300">
                  {GREETINGS[greetingIndex].text}
                </span>
                <span className="animate-wave-alt text-xs sm:text-sm inline-block">👋🏾</span>
              </span>
              <span className="font-display italic font-black text-amber-400 text-xs sm:text-sm tracking-wide group-hover:text-amber-300 transition-colors">
                KHADY'S FOOD & EVENT
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons (Mic, Bell, Sun, User) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
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

      {/* 3. FIXED BOTTOM NAVIGATION BAR - EXACT STYLE FROM SCREENSHOT (Bronze curved contour & Glowing orange circle) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-0.5 sm:px-4 pb-0 sm:pb-1 pointer-events-auto">
        <div className="max-w-3xl mx-auto rounded-t-[32px] sm:rounded-t-[36px] border-t-2 border-x-2 border-[#8C6239] bg-[#1A1410]/98 backdrop-blur-xl shadow-[0_-10px_35px_rgba(0,0,0,0.9)] py-1.5 sm:py-2 px-1 sm:px-3">
          <div className="flex items-center justify-between sm:justify-around gap-0.5">
            {/* 1. ACCUEIL */}
            <button
              onClick={() => onTabChange('accueil')}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Accueil"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentTab === 'accueil'
                    ? 'bg-gradient-to-tr from-[#FF5500] to-[#EA580C] text-white shadow-[0_0_18px_rgba(255,85,0,0.8)] scale-105 -translate-y-0.5'
                    : 'text-[#8E8680] group-hover:text-stone-200'
                }`}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-tight truncate max-w-full text-center mt-0.5 ${
                  currentTab === 'accueil' ? 'text-[#FFA726] font-black' : 'text-[#8E8680] font-bold'
                }`}
              >
                Accueil
              </span>
            </button>

            {/* 2. MENU */}
            <button
              onClick={() => onTabChange('carte')}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Menu"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentTab === 'carte'
                    ? 'bg-gradient-to-tr from-[#FF5500] to-[#EA580C] text-white shadow-[0_0_18px_rgba(255,85,0,0.8)] scale-105 -translate-y-0.5'
                    : 'text-[#8E8680] group-hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-tight truncate max-w-full text-center mt-0.5 ${
                  currentTab === 'carte' ? 'text-[#FFA726] font-black' : 'text-[#8E8680] font-bold'
                }`}
              >
                Menu
              </span>
            </button>

            {/* 3. GALERIE */}
            <button
              onClick={() => onTabChange('galerie')}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Galerie"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentTab === 'galerie'
                    ? 'bg-gradient-to-tr from-[#FF5500] to-[#EA580C] text-white shadow-[0_0_18px_rgba(255,85,0,0.8)] scale-105 -translate-y-0.5'
                    : 'text-[#8E8680] group-hover:text-stone-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-tight truncate max-w-full text-center mt-0.5 ${
                  currentTab === 'galerie' ? 'text-[#FFA726] font-black' : 'text-[#8E8680] font-bold'
                }`}
              >
                Galerie
              </span>
            </button>

            {/* 4. COMMANDE */}
            <button
              onClick={() => onTabChange('suivi')}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Commande & Suivi"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentTab === 'suivi'
                    ? 'bg-gradient-to-tr from-[#FF5500] to-[#EA580C] text-white shadow-[0_0_18px_rgba(255,85,0,0.8)] scale-105 -translate-y-0.5'
                    : 'text-[#8E8680] group-hover:text-stone-200'
                }`}
              >
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-tight truncate max-w-full text-center mt-0.5 ${
                  currentTab === 'suivi' ? 'text-[#FFA726] font-black' : 'text-[#8E8680] font-bold'
                }`}
              >
                Commande
              </span>
            </button>

            {/* 5. BLOG */}
            <button
              onClick={onOpenBlog}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Blog Culinaire"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#8E8680] group-hover:text-stone-200 transition-colors">
                <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight truncate max-w-full text-[#8E8680] group-hover:text-stone-300 text-center mt-0.5">
                Blog
              </span>
            </button>

            {/* 6. WHATSAPP */}
            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=Bonjour%20Khady%27s%20Food%20%26%20Event%2C%20je%20souhaite%20commander%20!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="WhatsApp direct"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#8E8680] group-hover:text-emerald-400 transition-colors">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight truncate max-w-full text-[#8E8680] group-hover:text-emerald-400 text-center mt-0.5">
                WhatsApp
              </span>
            </a>

            {/* 7. PANIER */}
            <button
              onClick={onOpenCart}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group relative"
              title="Panier"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#8E8680] group-hover:text-stone-200 transition-colors relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FF5500] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight truncate max-w-full text-[#8E8680] group-hover:text-stone-300 text-center mt-0.5">
                Panier
              </span>
            </button>

            {/* 8. COMPTE / MOI */}
            <button
              onClick={onOpenProfile}
              className="flex-1 min-w-0 flex flex-col items-center justify-center select-none group"
              title="Compte & Gérance"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#8E8680] group-hover:text-white transition-colors">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight truncate max-w-full text-[#8E8680] group-hover:text-white text-center mt-0.5">
                Moi
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
