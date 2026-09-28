import React, { useState } from 'react';
import { Bell, X, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

interface PushProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationsModal: React.FC<PushProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#1B1512] border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Bell className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Suivi PWA & Direct
          </span>
          <h2 className="text-xl font-black text-white">Notifications Push 🔔</h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            Recevez les alertes en temps réel à chaque étape : validation en cuisine, départ du livreur moto à Niamey, et promotions exclusives.
          </p>
        </div>

        <div className="p-4 bg-stone-900/90 rounded-2xl border border-stone-800 flex items-center justify-between text-left">
          <div>
            <div className="text-xs font-bold text-white">Alertes de livraison actives</div>
            <div className="text-[11px] text-stone-400">Mises à jour sans délai</div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              enabled ? 'bg-emerald-500' : 'bg-stone-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
              enabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-bold text-sm rounded-xl shadow-lg"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};
