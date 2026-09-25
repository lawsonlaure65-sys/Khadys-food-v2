import React from 'react';
import { User, ShieldCheck, Clock, MapPin, Phone, MessageSquare, ArrowRight, X } from 'lucide-react';
import { Order } from '../types';
import { RESTAURANT_INFO } from '../constants';
import { KhadyLogo } from './KhadyLogo';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenAdmin: () => void;
  onOpenOrderTracking: (order: Order) => void;
}

export const ProfileModal: React.FC<ProfileProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenAdmin,
  onOpenOrderTracking
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#181615] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#141211] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Espace Client & Gérance (Moi)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-4">
            <KhadyLogo size="md" showSubtitle={false} withText={false} />
            <div>
              <h3 className="text-sm font-bold text-white">Convive Privilégié Khady</h3>
              <p className="text-xs text-stone-400">Niamey, République du Niger</p>
              <span className="text-[10px] font-semibold text-emerald-400">● Compte Actif</span>
            </div>
          </div>

          {/* MANAGER / ADMIN ACCESS BUTTON (Crucial for adding dishes & managing them) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/40 to-stone-900 border-2 border-orange-500/40 space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Espace Gérant & Administration</h4>
                <p className="text-xs text-stone-300">
                  Ajoutez vos plats avec vos propres photos, modifiez les tarifs et gérez les rectangles de l'accueil.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Accéder à la Gestion des Plats & Rectangles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Orders Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Vos Dernières Commandes ({orders.length})</span>
            </h4>

            {orders.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 text-center text-xs text-stone-400">
                Vous n'avez pas encore passé de commande aujourd'hui.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => {
                      onOpenOrderTracking(order);
                      onClose();
                    }}
                    className="p-3 bg-stone-900/80 hover:bg-stone-850 rounded-xl border border-stone-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">Commande #{order.id}</div>
                      <div className="text-[11px] text-stone-400">
                        {order.items.length} article(s) • {order.totalAmount.toLocaleString()} FCFA
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Suivre
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restaurant WhatsApp Direct */}
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div className="text-xs text-stone-300">
                <span className="font-bold text-white block">Assistance & Commandes</span>
                <span>{RESTAURANT_INFO.phone}</span>
              </div>
            </div>
            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
