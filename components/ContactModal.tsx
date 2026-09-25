import React from 'react';
import { Settings, X, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Mail } from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface ContactProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const ContactModal: React.FC<ContactProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  if (!isOpen) return null;

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

        <div className="p-6 space-y-4 overflow-y-auto">
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

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">WhatsApp Direct Restaurant</div>
                <div className="text-[11px] text-emerald-300">+227 74 44 16 21</div>
              </div>
            </div>
            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              Écrire
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
