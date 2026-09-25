import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Search, Flame, Clock, Plus, Star } from 'lucide-react';

interface MenuProps {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MenuView: React.FC<MenuProps> = ({ items, onSelectItem, onQuickAdd }) => {
  const [selectedCat, setSelectedCat] = useState<string>('tous');
  const [search, setSearch] = useState<string>('');

  const categories = [
    { id: 'tous', label: 'Toute la Carte' },
    { id: 'plats', label: 'Plats Chauds' },
    { id: 'sauces', label: 'Box Sauces Khady' },
    { id: 'entrees', label: 'Entrées & Pastels' },
    { id: 'boissons', label: 'Jus Frais & Boissons' },
  ];

  const filtered = items.filter(it => {
    const matchesCat = selectedCat === 'tous' || it.category === selectedCat;
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase()) ||
                          it.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header and filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Cuisiné le jour même à Niamey
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1">
              La Carte & Les Box Sauces Khady
            </h1>
            <p className="text-sm text-stone-400 mt-1 max-w-xl">
              Chaque recette est préparée avec des produits nobles frais, sans arôme artificiel, selon les véritables secrets des marmites de grand-mère.
            </p>
          </div>

          {/* Search box & WhatsApp catalog */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher un plat, ingrédient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <a
              href="https://wa.me/c/74441621"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              title="Consulter le catalogue WhatsApp officiel"
            >
              <span>Catalogue WhatsApp ↗</span>
            </a>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/40'
                  : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Plat du Jour (si disponible et non filtré) */}
      {selectedCat === 'tous' && !search && (
        <div className="space-y-6">
          {items.filter(it => it.badge?.toLowerCase().includes('jour') && !it.name.toLowerCase().includes('doukounou') && !it.name.toLowerCase().includes('attieke') && !it.name.toLowerCase().includes('attiéké')).slice(0, 1).map(platJour => (
            <div
              key={platJour.id}
              onClick={() => onSelectItem(platJour)}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2B1B14] via-[#201511] to-[#17100D] border-2 border-amber-500/50 p-5 sm:p-6 shadow-2xl cursor-pointer group hover:border-amber-400 transition-all"
            >
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative w-full lg:w-72 h-52 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={platJour.image}
                    alt={platJour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black uppercase tracking-wider shadow">
                      ☀️ Plat du Jour
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider shadow">
                      Demain Midi
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                      ★ ÉDITION LIMITÉE DU CHEF
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase font-display">
                    {platJour.name}
                  </h2>
                  <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
                    {platJour.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Prix Spécial</span>
                      <span className="text-2xl font-black text-amber-400">
                        {platJour.price.toLocaleString()} <span className="text-xs text-orange-400">FCFA</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdd(platJour, e);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter au Panier</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Section 2: Incontournables / Spécialités Permanentes (Doukounou, Attiéké, Dibi, etc.) */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                  Coup de Cœur & Tradition
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase italic">
                  Nos Incontournables & Spécialités Permanentes
                </h2>
              </div>
              <span className="text-xs text-stone-400 hidden sm:block">
                Toujours disponibles à la commande
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.filter(it => it.id === 'item-doukounou-khady' || it.id === 'item-attieke-royal' || it.id === 'item-dibi-agneau' || it.badge?.toLowerCase().includes('permanente')).map(spe => (
                <div
                  key={spe.id}
                  onClick={() => onSelectItem(spe)}
                  className="group cursor-pointer bg-[#1D1714] rounded-2xl border-2 border-amber-500/30 hover:border-amber-400 transition-all p-4 flex flex-col justify-between hover:scale-[1.01] shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-xl overflow-hidden">
                      <img
                        src={spe.image}
                        alt={spe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow">
                        Spécialité Permanente
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base group-hover:text-amber-400 transition-colors">
                        {spe.name}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {spe.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-base font-black text-amber-400">
                      {spe.price.toLocaleString()} <span className="text-xs text-orange-400">FCFA</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(spe, e);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent my-2" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase italic mt-4">
              Toute la Carte par Catégorie
            </h2>
          </div>
        </div>
      )}

      {/* Grid of Dishes (Toute la Carte / Filtres) */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-stone-400 bg-[#181615] rounded-3xl border border-stone-800">
          <p className="text-base font-semibold text-white">Aucun plat ne correspond à votre recherche</p>
          <p className="text-xs text-stone-500 mt-1">Essayez un autre mot-clé ou sélectionnez une autre catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectItem(dish)}
              className="group cursor-pointer bg-[#181615] rounded-3xl border border-stone-800 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-orange-950/20 overflow-hidden flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full bg-stone-900 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181615] via-transparent to-black/30" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {dish.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-600/90 text-white shadow-md backdrop-blur-sm">
                      {dish.badge}
                    </span>
                  )}
                  {dish.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-stone-950" />
                      Incontournable
                    </span>
                  )}
                </div>

                {dish.preparationTime && (
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-stone-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>{dish.preparationTime}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-orange-400 transition-colors">
                      {dish.name}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Tarif Niamey</span>
                    <span className="text-lg font-black text-amber-400">
                      {dish.price.toLocaleString()} <span className="text-xs text-orange-400">FCFA</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(dish, e);
                    }}
                    className="p-2.5 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Ajouter au panier"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Panier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
