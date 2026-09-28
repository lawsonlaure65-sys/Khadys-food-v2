import React, { useState } from 'react';
import { Review, MenuItem } from '../types';
import { Star, MessageSquare, Plus, CheckCircle2, User, Sparkles, Send, Settings, Heart } from 'lucide-react';

interface GourmetReviewsProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
  items: MenuItem[];
  onOpenAdmin?: () => void;
}

export const GourmetReviewsSection: React.FC<GourmetReviewsProps> = ({
  reviews,
  onAddReview,
  items,
  onOpenAdmin
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [dishName, setDishName] = useState(items[0]?.name || 'Tiep Rouge Royal');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      author: author.trim(),
      rating,
      comment: comment.trim(),
      date: "Aujourd'hui",
      dishName: dishName || undefined,
      verified: true
    };

    onAddReview(newRev);
    setAuthor('');
    setComment('');
    setRating(5);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsFormOpen(false);
    }, 2000);
  };

  return (
    <section className="rounded-[32px] bg-gradient-to-b from-[#221813] via-[#1B130F] to-[#140E0B] border-2 border-amber-500/40 p-4 sm:p-7 shadow-2xl space-y-6 w-full max-w-full min-w-0">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
              ⭐ TÉMOIGNAGES AUTHENTIQUES
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
              Niamey & Régions
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black italic uppercase text-white font-display tracking-tight flex items-center gap-2">
            AVIS DES GOURMETS
            <Heart className="w-5 h-5 text-orange-500 fill-orange-500 inline-block animate-pulse-subtle" />
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Découvrez les retours de nos clients fidèles sur la finesse de nos sauces, nos poissons braisés et nos services traiteur.
          </p>
        </div>

        {/* Global Rating & Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 border border-amber-500/30 shadow-inner">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-display">
              {averageRating}
            </div>
            <div className="flex flex-col">
              <div className="flex text-amber-400 text-xs">
                {'★★★★★'}
              </div>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                {reviews.length} avis vérifiés
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Fermer' : 'Laisser un avis'}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-700 transition-colors"
              title="Gérer les avis dans l'Admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Formulaire Déroulant "Laisser un avis" */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#17110E] border-2 border-orange-500/40 p-4 sm:p-6 space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm sm:text-base font-black uppercase text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Partagez votre expérience culinaire
            </h3>
            <span className="text-[11px] text-stone-400">Publication instantanée</span>
          </div>

          {submittedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Merci pour votre avis gourmand ! Il est maintenant en ligne.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                Votre Nom ou Pseudo *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Ex: Aminata D., Dr. Moussa..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
                Plat ou Service Dégusté
              </label>
              <select
                value={dishName}
                onChange={e => setDishName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Tiep Rouge Royal">Tiep Rouge Royal</option>
                <option value="Dibi d'Agneau Grillé">Dibi d'Agneau Grillé</option>
                <option value="Thiéboudienne Penda Royal">Thiéboudienne Penda Royal</option>
                <option value="Poulet Braisé Yassa">Poulet Braisé Yassa</option>
                <option value="Box 3 Sauces Khady">Box 3 Sauces Khady</option>
                <option value="Pastels Farcis Chauds">Pastels Farcis Chauds</option>
                <option value="Attiéké Garba Poisson">Attiéké Garba Poisson</option>
                <option value="Service Traiteur & Buffet">Service Traiteur & Buffet</option>
                {items && items.filter(it => it && it.name).map(it => (
                  <option key={it.id} value={it.name}>{it.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Interactive */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1.5">
              Votre Note : {rating} / 5 étoiles
            </label>
            <div className="flex items-center gap-1.5 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-1">
              Votre Commentaire Gourmand *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Racontez le goût, la fraîcheur des ingrédients, la livraison ou votre moment de dégustation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publier mon avis</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Grille des Avis des Gourmets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl bg-[#1A1310] border border-amber-500/30 hover:border-amber-400/60 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group relative overflow-hidden"
          >
            {/* Top: Author, Avatar & Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {rev.avatar ? (
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/40 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-white text-xs sm:text-sm truncate group-hover:text-amber-300 transition-colors">
                    {rev.author}
                  </h4>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {rev.date}
                  </span>
                </div>
              </div>

              {rev.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Vérifié
                </span>
              )}
            </div>

            {/* Dish Tasted */}
            {rev.dishName && (
              <div className="text-[10px] font-bold text-amber-400/90 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-amber-500/20 truncate">
                🍽️ <span className="text-stone-300">Dégusté :</span> {rev.dishName}
              </div>
            )}

            {/* Star Rating */}
            <div className="flex items-center gap-0.5 text-amber-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < (rev.rating || 5) ? 'text-amber-400' : 'text-stone-600'}>
                  ★
                </span>
              ))}
            </div>

            {/* Comment Quote */}
            <p className="text-xs text-stone-300 italic leading-relaxed line-clamp-4 flex-1">
              « {rev.comment} »
            </p>

            {/* Bottom Glow bar on hover */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent group-hover:via-orange-500 transition-all" />
          </div>
        ))}
      </div>
    </section>
  );
};
