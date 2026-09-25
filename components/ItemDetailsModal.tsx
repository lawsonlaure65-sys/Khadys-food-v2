import React, { useState } from 'react';
import { MenuItem } from '../types';
import { X, Flame, Clock, Plus, Minus, ShoppingBag, Share2, Check } from 'lucide-react';
import { shareDishOnWhatsApp } from '../utils/whatsapp';

interface ModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, spice?: 'doux' | 'moyen' | 'pimenté', notes?: string, startPos?: { x: number; y: number }) => void;
}

export const ItemDetailsModal: React.FC<ModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [spice, setSpice] = useState<'doux' | 'moyen' | 'pimenté'>('moyen');
  const [notes, setNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!item) return null;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startPos = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setAddedAnimation(true);
    onAddToCart(item, quantity, spice, notes, startPos);

    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#181615] border border-orange-500/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-stone-900 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              // Graceful fallback to avoid broken image squares
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181615] via-[#181615]/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {item.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600/90 text-white shadow-lg backdrop-blur-sm border border-orange-400/30">
                {item.badge}
              </span>
            )}
            {item.isFeatured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/90 text-stone-950 shadow-lg">
                Incontournable
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-3 text-xs text-stone-300">
              {item.preparationTime && (
                <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  {item.preparationTime}
                </span>
              )}
              {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
                <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10 text-orange-400">
                  <Flame className="w-3.5 h-3.5" />
                  Niveau {item.spicyLevel}/3
                </span>
              )}
            </div>

            <button
              onClick={() => shareDishOnWhatsApp(item)}
              className="p-2 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-medium px-3"
              title="Partager sur WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {item.name}
              </h2>
              <span className="text-xl sm:text-2xl font-black text-amber-400 whitespace-nowrap">
                {item.price.toLocaleString()} <span className="text-sm font-semibold text-orange-400">FCFA</span>
              </span>
            </div>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Ingrédients principaux & Assaisonnement
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-stone-800/80 text-xs text-stone-200 border border-stone-700/60"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spice Preference */}
          {item.category !== 'boissons' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                Niveau de piment souhaité
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['doux', 'moyen', 'pimenté'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpice(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all text-center ${
                      spice === lvl
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    {lvl === 'doux' && '🍃 Doux'}
                    {lvl === 'moyen' && '🌶️ Équilibré'}
                    {lvl === 'pimenté' && '🔥 Fort Khady'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">
              Instructions ou préférences (facultatif)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sans oignons, sauce à part, bien cuit..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#141211] border-t border-stone-800/80 flex items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-stone-800/80 rounded-xl p-1 border border-stone-700/60">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button (triggers flying effect) */}
          <button
            onClick={handleAdd}
            className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
              addedAnimation
                ? 'bg-emerald-600 scale-[0.98]'
                : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-950/50 hover:shadow-orange-900/60 hover:scale-[1.01]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-5 h-5 animate-scale-up" />
                <span>Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Ajouter {(item.price * quantity).toLocaleString()} FCFA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
