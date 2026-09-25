import React from 'react';
import { BookOpen, X, Clock, Calendar, ArrowRight } from 'lucide-react';

interface BlogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const articles = [
    {
      title: "Le Secret du Dibi d'Agneau au Feu de Bois de Niamey",
      date: "22 Septembre 2026",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      excerpt: "Découvrez comment nos maîtres grilladins sélectionnent les morceaux d'agneau sahélien et préparent le mélange d'épices Kankankan selon la tradition."
    },
    {
      title: "Comment Réussir un Thiéboudienne Rouge Royal Parfait",
      date: "18 Septembre 2026",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      excerpt: "Le secret réside dans le rissolage des oignons, le choix du mérou frais et la cuisson lente du riz cassé parfumé."
    },
    {
      title: "Les Box Sauces Khady : Cuisiner en 10 minutes à la Maison",
      date: "10 Septembre 2026",
      readTime: "3 min",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
      excerpt: "Nos 3 sauces artisanales pasteurisées vous permettent de préparer Mafé, Yassa et marinades sans aucun conservateur chimique."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#181615] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#141211] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Blog & Recettes Khady's Food</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row gap-4 group"
            >
              <img
                src={art.image}
                alt={art.title}
                className="w-full sm:w-36 h-32 object-cover rounded-xl"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-400" />
                      {art.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {art.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                    Lire la suite <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
