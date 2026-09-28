import React, { useState } from 'react';
import { TRAITEUR_PACKAGES } from '../constants';
import { TraiteurPackage } from '../types';
import { Calendar, Users, MapPin, Check, Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateWhatsAppTraiteurLink } from '../utils/whatsapp';

export const TraiteurView: React.FC = () => {
  const [selectedPkg, setSelectedPkg] = useState<TraiteurPackage | null>(null);
  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('Niamey (Hôtel / Villa privée)');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenQuote = (pkg: TraiteurPackage) => {
    setSelectedPkg(pkg);
    setGuestCount(pkg.minGuests);
    setFormError(null);
    setShowModal(true);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    if (!clientName.trim() || !clientPhone.trim()) {
      setFormError("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    const waLink = generateWhatsAppTraiteurLink(selectedPkg, {
      guestCount,
      date: eventDate || "Date à convenir",
      location: eventLocation || "Niamey",
      name: clientName.trim(),
      phone: clientPhone.trim(),
      notes
    });

    window.open(waLink, '_blank');
    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E1612] via-[#2D1B15] to-[#1E1612] border border-orange-500/20 p-8 sm:p-12 text-center shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Khady's Event • Niamey
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            L'Élégance du Service Traiteur Africain
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Mariages princiers, séminaires ministériels et d'entreprises, cocktails et baptêmes. Faites vivre à vos convives l'excellence des saveurs d'Afrique de l'Ouest avec un service raffiné et ponctuel.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Service en gants & chafing dishes
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Dégustation offerte pour 2
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-orange-400" />
              De 15 à 1 000 convives
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Nos Formules Événementielles
          </h2>
          <p className="text-sm text-stone-400">
            Chaque formule est 100% personnalisable selon vos goûts et vos exigences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRAITEUR_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl bg-[#181615] border overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01] ${
                pkg.popular
                  ? 'border-amber-500/50 shadow-2xl shadow-orange-950/40 relative'
                  : 'border-stone-800'
              }`}
            >
              {pkg.popular && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-black uppercase tracking-wider py-1.5 text-center">
                  Formule la plus demandée à Niamey
                </div>
              )}

              <div className="relative h-48 w-full bg-stone-900">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181615] via-transparent to-black/30" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-2xl font-black text-amber-400">
                    {pkg.pricePerPerson.toLocaleString()} <span className="text-xs font-normal text-stone-300">FCFA / convive</span>
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 italic">
                    "{pkg.tagline}"
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-stone-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800">
                  <button
                    onClick={() => handleOpenQuote(pkg)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all"
                  >
                    <span>Calculer mon devis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Calculation Modal */}
      {showModal && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div
            className="relative w-full max-w-lg bg-[#181615] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Devis Personnalisé Khady's Event
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedPkg.title}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 mb-1 block">
                  Nombre d'invités : <span className="text-amber-400 font-bold">{guestCount} personnes</span>
                </label>
                <input
                  type="range"
                  min={selectedPkg.minGuests}
                  max={500}
                  step={5}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>Min: {selectedPkg.minGuests} pers.</span>
                  <span>500+ pers.</span>
                </div>
              </div>

              {/* Estimation */}
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/25 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-300">Estimation du devis</span>
                  <p className="text-xs text-stone-400">({selectedPkg.pricePerPerson.toLocaleString()} FCFA x {guestCount} invités)</p>
                </div>
                <div className="text-xl font-black text-amber-400">
                  {(selectedPkg.pricePerPerson * guestCount).toLocaleString()} FCFA
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 mb-1 block">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: M. Ousmane"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-300 mb-1 block">
                    Téléphone WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: +227 96 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 mb-1 block">
                    Date prévue
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-300 mb-1 block">
                    Lieu à Niamey
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Ex: Koira Kano, Résidence"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 mb-1 block">
                  Souhaits particuliers / Menu souhaité
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Bar à jus naturels, 100% agneau grillé, besoin de serveurs..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                  ⚠️ {formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Envoyer ma demande sur WhatsApp Khady</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
