import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { loadPushPreference, savePushPreference } from '../utils/offlineDB';

interface PushProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationsModal: React.FC<PushProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState<boolean>(() => loadPushPreference());
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEnabled(loadPushPreference());
      setStatusNote(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    const next = !enabled;
    if (next && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            setEnabled(false);
            savePushPreference(false);
            setStatusNote("Autorisation de notification refusée dans le navigateur.");
            return;
          }
        } else if (Notification.permission === 'denied') {
          setEnabled(false);
          savePushPreference(false);
          setStatusNote("Notifications bloquées dans les paramètres de votre navigateur.");
          return;
        }
      } catch {}
    }

    setEnabled(next);
    savePushPreference(next);
    setStatusNote(next ? "Préférence enregistrée pour les alertes en direct." : "Alertes désactivées.");
  };

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
            Recevez les alertes pour la confirmation en cuisine, le départ en livraison à Niamey, et les offres du jour.
          </p>
        </div>

        <div className="p-4 bg-stone-900/90 rounded-2xl border border-stone-800 flex items-center justify-between text-left">
          <div>
            <div className="text-xs font-bold text-white">Alertes de livraison actives</div>
            <div className="text-[11px] text-stone-400">
              {enabled ? 'Activées sur cet appareil' : 'Désactivées'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              enabled ? 'bg-emerald-500' : 'bg-stone-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
              enabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        {statusNote && (
          <p className="text-[11px] text-amber-300 font-medium">{statusNote}</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-bold text-sm rounded-xl shadow-lg"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
