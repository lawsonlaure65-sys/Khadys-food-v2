import React, { useState } from 'react';
import { Sparkles, Heart, Eye } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'plats' | 'grillades' | 'traiteur'>('all');

  const photos = [
    {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      title: "Dibi d'Agneau au Feu de Bois",
      category: "grillades",
      desc: "Trésor sahélien de Niamey, viande tendre et assaisonnée"
    },
    {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      title: "Thiéboudienne Rouge Royale Penda",
      category: "plats",
      desc: "Riz parfumé, mérou frais et légumes fondants"
    },
    {
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      title: "Brochettes & Grillades Nobles",
      category: "grillades",
      desc: "Épices Kankankan et braisage minute"
    },
    {
      url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
      title: "Les Box Sauces Artisanales Khady",
      category: "plats",
      desc: "Yassa, Mafé et Piment Vert en bocaux pasteurisés"
    },
    {
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      title: "Buffet Traiteur Réception Sahel",
      category: "traiteur",
      desc: "Présentation d'honneur pour mariages et cérémonies"
    },
    {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      title: "Pastels Dorés & Sauce Pimentée",
      category: "plats",
      desc: "Pâte feuilletée croustillante farcie au poisson frais"
    }
  ];

  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600/20 text-orange-400 border border-orange-500/30">
          Photothèque Khady's Food
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Galerie Gourmande & Événements
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
          Explorez l'art culinaire de Niamey en images : spécialités cuisinées avec passion et réceptions d'exception.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'all', label: 'Toutes les photos' },
          { id: 'grillades', label: 'Grillades & Dibi' },
          { id: 'plats', label: 'Plats Cuisinés' },
          { id: 'traiteur', label: 'Événements & Traiteur' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === cat.id
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 hover:border-amber-500/40 shadow-xl transition-all"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
              <p className="text-xs text-stone-300">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
