import React from 'react';
import { Sparkles, Utensils, ShieldCheck } from 'lucide-react';

export const Demo4kView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Coulisses Culinaires
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
          Coulisses & Démonstration Culinaire
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
          Plongez au cœur des cuisines de Khady's Food & Event : le crépitement des braises, la vapeur des marmites et l'art de nos chefs à Niamey.
        </p>
      </div>

      {/* Lightweight culinary card */}
      <div className="relative rounded-3xl overflow-hidden border border-orange-500/30 shadow-xl bg-stone-900 aspect-video flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=75"
          alt="Coulisses Culinaires"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

        <div className="relative z-10 p-4 sm:p-6 text-center space-y-3 max-w-md bg-[#1B1512]/95 rounded-2xl border border-amber-500/30 shadow-xl mx-3">
          <div className="w-12 h-12 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
              Savoir-Faire Traditionnel Sahélien
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Le Festin Royal de Niamey</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Chaque morceau d'agneau est mariné 12 heures et grillé sur bois d'acacia pour garantir ce goût noble et authentique.
            </p>
          </div>
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider">
            Niamey Cuisine
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 text-stone-200 text-[10px] font-semibold border border-white/10">
            Fait Maison
          </span>
        </div>
      </div>
    </div>
  );
};
