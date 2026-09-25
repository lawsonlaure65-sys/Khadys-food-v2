import React, { useState } from 'react';
import { Play, Sparkles, Flame, Volume2, ShieldCheck } from 'lucide-react';

export const Demo4kView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Expérience Visuelle Ultra HD
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Démonstration 4K & Coulisses Culinaires
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
          Plongez au cœur des cuisines de Khady's Food & Event : le crépitement des braises, la vapeur des marmites et l'art de nos chefs.
        </p>
      </div>

      {/* Main 4K Video Spotlight Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/40 shadow-2xl bg-black aspect-video flex items-center justify-center group">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
          alt="4K Video Preview"
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isPlaying ? 'opacity-80' : 'opacity-60'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {!isPlaying ? (
          <div className="relative z-10 text-center space-y-4">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:scale-110 text-white flex items-center justify-center shadow-2xl shadow-orange-900 transition-all mx-auto"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
                Vidéo Démo 4K 60fps
              </span>
              <h3 className="text-xl font-bold text-white">Le Festin Royal de Niamey</h3>
            </div>
          </div>
        ) : (
          <div className="relative z-10 p-6 text-center space-y-4 max-w-md bg-stone-900/90 rounded-2xl border border-amber-500/40">
            <Flame className="w-10 h-10 text-orange-500 mx-auto animate-pulse" />
            <h4 className="text-base font-bold text-white">Lecture en direct de la cuisine</h4>
            <p className="text-xs text-stone-300">
              Chaque morceau d'agneau est mariné 12 heures et grillé sur bois d'acacia pour garantir ce goût incomparable.
            </p>
            <button
              onClick={() => setIsPlaying(false)}
              className="px-4 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:text-white"
            >
              Mettre en pause
            </button>
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
            4K HDR
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 text-stone-200 text-[10px] font-semibold backdrop-blur-sm border border-white/10">
            Niamey, Niger
          </span>
        </div>
      </div>
    </div>
  );
};
