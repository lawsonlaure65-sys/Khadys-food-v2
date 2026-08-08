
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, MenuCategory } from '../types';
import { Search, SlidersHorizontal, Flame, Star, Plus, Utensils, ShoppingBag, Sparkles, WifiOff, Database, Mic } from 'lucide-react';
import { playSound } from '../utils/audio';

interface MenuViewProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onOpenVoiceModal?: () => void;
}

const MAIN_SECTIONS = [
  { id: 'CARTE', label: 'LA CARTE', icon: <Utensils size={16} /> },
  { id: 'BOX', label: 'BOX SAUCES', icon: <ShoppingBag size={16} /> },
  { id: 'PACK', label: 'PACK-BUFFET', icon: <Sparkles size={16} /> }
];

const CARTE_CATEGORIES: (MenuCategory | 'TOUT')[] = [
  'TOUT', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Boisson Naturelle', 'Entrée', 'Spécialité Maison', 'Menu du Jour', 'Plat Africain', 'Dessert'
];

const MenuView: React.FC<MenuViewProps> = ({ items, onSelectItem, activeSection, onSectionChange, onOpenVoiceModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'TOUT'>('TOUT');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeSection === 'BOX') {
        return item.category === 'Box Sauce' && matchesSearch;
      }
      
      if (activeSection === 'PACK') {
        return item.category === 'Pack-Buffet' && matchesSearch;
      }
      
      // CARTE SECTION
      const isCarteItem = item.category !== 'Box Sauce' && item.category !== 'Pack-Buffet';
      const matchesCategory = selectedCategory === 'TOUT' || item.category === selectedCategory;
      
      return isCarteItem && matchesCategory && matchesSearch;
    });
  }, [items, activeSection, selectedCategory, searchQuery]);

  return (
    <div className="animate-fade-in pt-6 pb-20">
      <header className="px-6 mb-8">
        {!navigator.onLine && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 px-3.5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-1.5"><WifiOff size={14} className="text-amber-600 animate-pulse" /> Mode Hors-ligne : Carte chargée via IndexedDB</span>
            <span className="text-[8px] bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1"><Database size={10}/> {items.length} Plats</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black italic uppercase text-brand-brown leading-tight">
            Notre <br/>
            <span className="text-brand-orange text-lg tracking-[0.3em]">Univers</span>
          </h2>
          <div className="bg-brand-gold/20 p-3 rounded-2xl">
            <Utensils size={24} className="text-brand-brown" />
          </div>
        </div>

        {/* Main Sections Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-[2rem] mb-8 shadow-inner">
          {MAIN_SECTIONS.map(section => (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('pop'); onSectionChange(section.id); setSelectedCategory('TOUT'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.6rem] text-[9px] font-black uppercase tracking-tighter transition-all relative ${activeSection === section.id ? 'bg-white text-brand-brown shadow-md' : 'text-gray-400 hover:text-brand-brown'}`}
            >
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeSectionBg"
                  className="absolute inset-0 bg-white rounded-[1.6rem] shadow-md z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {section.icon}
                {section.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 gap-3">
              <Search size={18} className="text-gray-300" />
              <input 
                type="text" 
                placeholder="Rechercher un délice..." 
                className="w-full py-4 text-xs font-bold outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           {onOpenVoiceModal && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => { playSound('pop'); onOpenVoiceModal(); }}
               className="bg-brand-orange text-white p-4 rounded-2xl shadow-lg hover:bg-brand-gold hover:text-brand-brown transition-all flex items-center justify-center shrink-0"
               title="Commande Vocale 🎙️"
             >
               <Mic size={20} className="animate-pulse" />
             </motion.button>
           )}
        </div>

        {activeSection === 'CARTE' && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
             {CARTE_CATEGORIES.map(cat => {
               const isSelected = selectedCategory === cat;
               return (
                 <motion.button 
                   key={cat}
                   whileHover={{ scale: 1.04 }}
                   whileTap={{ scale: 0.94 }}
                   onClick={() => { playSound('pop'); setSelectedCategory(cat); }}
                   className={`relative px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                     isSelected 
                       ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30' 
                       : 'bg-white text-gray-400 border border-gray-100 hover:text-brand-brown'
                   }`}
                 >
                   {isSelected && (
                     <motion.div
                       layoutId="activeCategoryPill"
                       className="absolute inset-0 bg-brand-orange rounded-full z-0 shadow-lg shadow-brand-orange/30"
                       transition={{ type: "spring", stiffness: 350, damping: 28 }}
                     />
                   )}
                   <span className="relative z-10">{cat}</span>
                 </motion.button>
               );
             })}
          </div>
        )}
      </header>

      {/* Grid of Dishes with fluid scale and opacity animations */}
      <motion.div 
        layout
        className="px-6 grid grid-cols-2 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div 
              layout
              key={item.id} 
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ 
                duration: 0.28, 
                delay: Math.min(index * 0.03, 0.18),
                ease: [0.21, 0.85, 0.35, 1] 
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { playSound('pop'); onSelectItem(item); }}
              className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-brand-brown/5 relative group cursor-pointer h-full flex flex-col"
            >
               <div className="relative h-32 w-full mb-4 overflow-hidden rounded-[1.8rem] flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  {item.isSpicy && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                       <Flame size={12} fill="white" />
                    </div>
                  )}
                  {item.rating === 5 && (
                    <div className="absolute bottom-2 left-2 bg-brand-gold text-brand-brown px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1 border border-white">
                       <Star size={8} fill="currentColor" /> BEST
                    </div>
                  )}
               </div>
               
               <h4 className="text-[11px] font-black text-brand-brown uppercase italic leading-tight mb-2 line-clamp-2 flex-1">{item.name}</h4>
               
               <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-black text-brand-orange">{item.price.toLocaleString()} F</span>
                  <div className="w-8 h-8 bg-brand-brown text-brand-gold rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:bg-brand-orange group-hover:text-white">
                     <Plus size={16} />
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="py-20 text-center opacity-40 italic flex flex-col items-center"
          >
             <Search size={40} className="mb-4 text-brand-orange animate-pulse" />
             <p className="text-xs font-bold text-brand-brown">Aucun plat trouvé dans cette catégorie.</p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MenuView;
