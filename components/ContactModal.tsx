import React, { useState } from 'react';
import { Settings, X, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Mail, Truck, Navigation, Search, CheckCircle2 } from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface ContactProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

interface DeliveryZoneInfo {
  id: string;
  name: string;
  price: number;
  timeEstimate: string;
  badgeColor: string;
  neighborhoods: string[];
}

const DELIVERY_ZONES: DeliveryZoneInfo[] = [
  {
    id: 'zone-1',
    name: 'Zone 1 — Centre & Proximité',
    price: 1000,
    timeEstimate: '15 - 25 min',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    neighborhoods: ['Plateau', 'Yantala (Haut & Bas)', 'Recasement', 'Terminus', 'Rond-Point Justice', 'Place Toumo', 'Grande Mosquée']
  },
  {
    id: 'zone-2',
    name: 'Zone 2 — Quartiers Résidentiels',
    price: 1500,
    timeEstimate: '25 - 40 min',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    neighborhoods: ['Koira Kano', 'Koira Tégui', 'Bobiel', 'Dar-es-Salam', 'Francophonie', 'Nouveau Marché', 'Grand Marché', 'Cité Fayçal']
  },
  {
    id: 'zone-3',
    name: 'Zone 3 — Périphérie & Est / Sud',
    price: 2000,
    timeEstimate: '35 - 50 min',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    neighborhoods: ['Harobanda', 'Banifandou', 'Gamkalley', 'Talladjé', 'Saga', 'Aéroport', 'Route Tillabéri', 'Lazaret']
  },
  {
    id: 'zone-4',
    name: 'Zone 4 — Rive Droite & Éloignés',
    price: 2500,
    timeEstimate: '45 - 60 min',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    neighborhoods: ['Kirkissoye', 'Goudel', 'Rive Droite (Université UAM)', 'Route Torodi', 'Pays-Bas', 'Tchangarey']
  }
];

export const ContactModal: React.FC<ContactProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const [searchQuartier, setSearchQuartier] = useState('');

  if (!isOpen) return null;

  const filteredZones = DELIVERY_ZONES.map(z => {
    if (!searchQuartier.trim()) return { ...z, matches: z.neighborhoods };
    const query = searchQuartier.toLowerCase().trim();
    const matches = z.neighborhoods.filter(q => q.toLowerCase().includes(query));
    return { ...z, matches };
  }).filter(z => !searchQuartier.trim() || z.matches.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#181615] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#141211] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Contact & Informations Utiles</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Restaurant Coordonnées */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Restaurant Khady's Food & Event</h3>
            
            <div className="flex items-start gap-2.5 text-xs text-stone-300">
              <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span>{RESTAURANT_INFO.address}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Téléphone : {RESTAURANT_INFO.phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Horaires : {RESTAURANT_INFO.openingHours}</span>
            </div>
          </div>

          {/* NOUVELLE SECTION : Zones de livraison à Niamey */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#201611] to-[#17100D] border-2 border-amber-500/40 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-amber-400 tracking-wide flex items-center gap-1.5">
                    <span>Zones de livraison à Niamey</span>
                    <span className="text-xs">🛵</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-400">
                    Tarifs et délais estimés selon votre quartier
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 uppercase whitespace-nowrap">
                4 livreurs actifs
              </span>
            </div>

            {/* Barre de recherche de quartier */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher votre quartier (Plateau, Koira Kano, Saga...)"
                value={searchQuartier}
                onChange={e => setSearchQuartier(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
              />
              {searchQuartier && (
                <button
                  onClick={() => setSearchQuartier('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Liste des Zones et Quartiers */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredZones.map(zone => (
                <div
                  key={zone.id}
                  className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {zone.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-orange-600/30 border border-orange-500/40 text-orange-300 text-[11px] font-black">
                        {zone.price.toLocaleString()} F CFA
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {zone.timeEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Quartiers couverts */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {zone.matches.map((q, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          searchQuartier && q.toLowerCase().includes(searchQuartier.toLowerCase().trim())
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 font-bold'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {filteredZones.length === 0 && (
                <div className="p-3 rounded-xl bg-stone-900/80 text-center text-xs text-stone-400">
                  Quartier non listé ? Contactez-nous sur WhatsApp pour une livraison sur-mesure !
                </div>
              )}
            </div>

            {/* Note informative */}
            <div className="pt-1 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
              <span>🎁 Livraison offerte dès 25 000 F CFA</span>
              <span className="text-emerald-400 font-bold">Paiement à la livraison</span>
            </div>
          </div>

          {/* 1. Contact direct WhatsApp */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <MessageSquare className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Discuter avec le restaurant</div>
                <div className="text-[11px] text-emerald-300 font-mono">+227 74 44 16 21</div>
              </div>
            </div>
            <a
              href={RESTAURANT_INFO.whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex-shrink-0"
            >
              Écrire
            </a>
          </div>

          {/* 2. Catalogue WhatsApp Officiel */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <MessageSquare className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Catalogue WhatsApp</div>
                <div className="text-[11px] text-amber-300 truncate">Consulter le catalogue officiel</div>
              </div>
            </div>
            <a
              href={RESTAURANT_INFO.whatsappCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex-shrink-0"
            >
              Voir
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Paiements Acceptés à Niamey
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              ZAMANY MONEY (Orange), MYNITA, AMANATA, ALL-IZA, ZEYNAB, AIRTEL MONEY, MOOV MONEY, Espèces à la livraison.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full py-2.5 bg-stone-850 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-xl border border-stone-700 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>Accéder à la Console Admin Elite</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

