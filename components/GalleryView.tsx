import React, { useState } from 'react';
import { MenuItem, Page } from '../types';
import { Sparkles, ShoppingBag, Eye, X, ChevronLeft, Filter, Heart, ArrowRight, Share2, Check } from 'lucide-react';
import { playSound } from '../utils/audio';

interface GalleryViewProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number, instructions: string) => void;
  onNavigateToMenu: () => void;
}

export const GALLERY_IMAGES = [
  {
    id: 'g1',
    title: 'Tiep Royal Khady',
    category: 'Spécialités',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=1200',
    description: 'Le chef-d\'œuvre Khady\'s avec son capitaine braisé aux aromates du Niger et légumes fondants.',
    price: 5500,
    likes: 142
  },
  {
    id: 'g2',
    title: 'Plateau Prestige Event',
    category: 'Traiteur',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    description: 'Giga assortiment royal de brochettes Suya, pastels, alloco doré et ailes de poulet fermier.',
    price: 15000,
    likes: 289
  },
  {
    id: 'g3',
    title: 'Soupou Kandia aux Crabes & Crevettes',
    category: 'Plats',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200',
    description: 'Ragoût traditionnel d\'okra mijoté à l\'huile de palme rouge fine et crustacés frais.',
    price: 5000,
    likes: 98
  },
  {
    id: 'g4',
    title: 'Bissap Rouge & Bouye Onctueux',
    category: 'Boissons Naturelles',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=1200',
    description: 'Nectars naturels préparés chaque matin avec des hibiscus du Sahel et baobab sauvage.',
    price: 1000,
    likes: 310
  },
  {
    id: 'g5',
    title: 'Pastels Dorés Piquants',
    category: 'Entrées',
    image: 'https://images.unsplash.com/photo-1601050638917-3f80bc61a4bb?w=1200',
    description: 'Petits chaussons ultra-croustillants farcis au thon et herbes fraîches avec sauce pimentée.',
    price: 1500,
    likes: 215
  },
  {
    id: 'g6',
    title: 'Brochettes Suya Kankankan',
    category: 'Spécialités',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200',
    description: 'Filet de bœuf tendre mariné au mélange secret Kankankan et grillé au feu de bois.',
    price: 4000,
    likes: 178
  },
  {
    id: 'g7',
    title: 'Buffet d\'Exception Khady\'s',
    category: 'Traiteur',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200',
    description: 'Mise en scène gastronomique pour mariages et réceptions VIP à Niamey.',
    price: 180000,
    likes: 412
  },
  {
    id: 'g8',
    title: 'Dambou du Jour au Moringa',
    category: 'Plats',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
    description: 'Couscous de moringa frais parfumé à l\'huile d\'arachide et graines torréfiées.',
    price: 2500,
    likes: 165
  }
];

const GalleryView: React.FC<GalleryViewProps> = ({ items, onAddToCart, onNavigateToMenu }) => {
  const [activeCategory, setActiveCategory] = useState<string>('TOUT');
  const [selectedPhoto, setSelectedPhoto] = useState<typeof GALLERY_IMAGES[0] | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});

  const categories = ['TOUT', 'Spécialités', 'Plats', 'Entrées', 'Boissons Naturelles', 'Traiteur'];

  const filteredPhotos = activeCategory === 'TOUT' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(p => p.category === activeCategory);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('pop');
    setLikedPhotos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOrderPhotoDish = (photo: typeof GALLERY_IMAGES[0]) => {
    // Find matching menu item or construct synthetic
    const match = items.find(i => i.name.toLowerCase().includes(photo.title.toLowerCase().substring(0, 5))) || {
      id: photo.id,
      name: photo.title,
      description: photo.description,
      price: photo.price,
      image: photo.image,
      category: photo.category as any,
      rating: 5,
      isAvailable: true
    };

    onAddToCart(match, 1, 'Commande directe depuis la Galerie HD');
    setSelectedPhoto(null);
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pb-36 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black uppercase text-brand-orange tracking-[0.3em] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="animate-pulse" /> Galerie Haute Définition
          </span>
          <h2 className="text-3xl font-black italic uppercase text-brand-brown leading-none">
            NOS <span className="text-brand-orange">CHEF-D'ŒUVRES</span>
          </h2>
        </div>
        <button 
          onClick={onNavigateToMenu}
          className="px-4 py-2 bg-brand-brown text-brand-gold rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-md"
        >
          Menu complet <ArrowRight size={14} />
        </button>
      </header>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { playSound('pop'); setActiveCategory(cat); }}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-105' 
                : 'bg-white text-brand-brown/60 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Photos */}
      <div className="grid grid-cols-2 gap-4">
        {filteredPhotos.map((photo) => {
          const isLiked = !!likedPhotos[photo.id];
          return (
            <div 
              key={photo.id}
              onClick={() => { playSound('pop'); setSelectedPhoto(photo); }}
              className="group relative h-64 rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-white/80 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
            >
              <img 
                src={photo.image} 
                alt={photo.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[7px] font-black uppercase tracking-widest border border-white/20">
                {photo.category}
              </div>

              {/* Like Button */}
              <button 
                onClick={(e) => toggleLike(photo.id, e)}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60'
                }`}
              >
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              </button>

              {/* Bottom Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-black text-xs italic uppercase tracking-tight text-white leading-tight mb-1 group-hover:text-brand-gold transition-colors">
                  {photo.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-brand-gold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {photo.price} F
                  </span>
                  <span className="text-[8px] font-black text-white/80 flex items-center gap-1">
                    <Eye size={12} /> Vue HD
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#1A0F0D] text-white rounded-[3.5rem] overflow-hidden border-4 border-white/10 shadow-2xl animate-scale-up">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black transition-all"
            >
              <X size={22} />
            </button>

            {/* Photo HD */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0D] via-transparent to-transparent"></div>
              <span className="absolute bottom-4 left-6 bg-brand-orange text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                Khady's Signature
              </span>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black italic uppercase text-brand-gold tracking-tight mb-2">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-bold">
                  {selectedPhoto.description}
                </p>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/10">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">Prix Portions Recommandée</span>
                  <span className="text-2xl font-black text-brand-gold">{selectedPhoto.price} F CFA</span>
                </div>
                <div className="flex items-center gap-2 text-brand-orange text-[9px] font-black uppercase">
                  <Sparkles size={14} /> Préparé à la minute
                </div>
              </div>

              <button 
                onClick={() => handleOrderPhotoDish(selectedPhoto)}
                className="w-full bg-brand-orange text-white py-5 rounded-2xl font-black uppercase italic shadow-[0_15px_40px_rgba(255,111,0,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all text-xs tracking-wider"
              >
                <ShoppingBag size={18} /> Commander Directement ce Plat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
