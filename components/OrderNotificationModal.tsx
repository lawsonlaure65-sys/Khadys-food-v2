import React, { useEffect } from 'react';
import { Order } from '../types';
import { 
  Bell, CheckCircle2, MessageSquare, Volume2, Sparkles, 
  ChefHat, Bike, Send, ShieldCheck, X, ArrowRight, PhoneCall
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { RESTAURANT_INFO, BILLO_INFO } from '../constants';

interface OrderNotificationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder?: () => void;
  onOpenPushNotification?: () => void;
}

export const OrderNotificationModal: React.FC<OrderNotificationModalProps> = ({ order, onClose, onTrackOrder, onOpenPushNotification }) => {
  if (!order) return null;

  useEffect(() => {
    // Play dual notification sounds on mount
    playSound('notification');
    const timer = setTimeout(() => {
      playSound('cash');
    }, 400);
    return () => clearTimeout(timer);
  }, [order]);

  const replaySound = () => {
    playSound('notification');
    setTimeout(() => playSound('cash'), 300);
  };

  const handleOpenRestaurantWhatsApp = () => {
    playSound('pop');
    let waMsg = `*Salam Khady's Food ! NOUVELLE COMMANDE EN CUISINE (${order.id})*\n\n`;
    waMsg += `*Client :* ${order.customerName} (${order.phone})\n`;
    waMsg += `*Quartier / Adresse :* ${order.district} - ${order.address || 'Au restaurant'}\n\n`;
    waMsg += `*DÉTAIL DU FESTIN :*\n`;
    order.items.forEach(item => {
      waMsg += `• ${item.quantity}x ${item.name} (${item.price * item.quantity} F)\n`;
    });
    waMsg += `\n*Sous-Total Repas :* ${order.total} F CFA\n`;
    waMsg += `*Frais Livraison Billo :* ${order.deliveryFee} F CFA\n`;
    waMsg += `*TOTAL NET À PAYER :* ${order.total + order.deliveryFee} F CFA\n`;
    waMsg += `*Mode de Paiement :* ${order.paymentMethod}\n`;
    if (order.paymentTransactionId) {
      waMsg += `*Réf Dépôt Txn :* ${order.paymentTransactionId}\n`;
    }
    waMsg += `\nMerci de lancer la préparation en cuisine ! 🥘`;

    const waUrl = `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenBilloWhatsApp = () => {
    playSound('pop');
    let waMsg = `*Bonjour Billo Express ! DEMANDE DE LIVRAISON (${order.id})*\n\n`;
    waMsg += `*Nom du Client :* ${order.customerName}\n`;
    waMsg += `*Téléphone Client :* ${order.phone}\n`;
    waMsg += `*Quartier & Adresse :* ${order.district} - ${order.address || 'Plateau'}\n`;
    waMsg += `*Point de Collecte :* Khady's Food (Grande mosquée : Muamar Kadafi, Niamey)\n\n`;
    waMsg += `*Total à Encaisser/Paiement :* ${order.total + order.deliveryFee} F CFA (${order.paymentMethod})\n`;
    waMsg += `\nMerci de dépêcher un coursier pour l'enlèvement du colis ! 🏍️💨`;

    const waUrl = `https://wa.me/${BILLO_INFO.whatsappClean}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');
  };

  const handleDirectCall = () => {
    playSound('pop');
    window.location.href = `tel:${RESTAURANT_INFO.directLineClean}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#160D0A] rounded-[3.5rem] border-4 border-brand-gold/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(255,179,0,0.3)] text-white overflow-hidden">
        
        {/* Animated Background Rays */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-brand-orange/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-brand-gold/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-white/60 hover:text-white hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-20"
        >
          <X size={20} />
        </button>

        {/* Header Alert Badge */}
        <div className="text-center relative z-10 mb-6">
          <div className="relative inline-block mb-3">
            {/* Animated Pulsing Rings */}
            <div className="absolute inset-0 bg-brand-orange/40 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center text-brand-brown shadow-2xl mx-auto border-4 border-white">
              <ChefHat size={38} className="animate-bounce-subtle" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <span className="bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] inline-flex items-center gap-2 border border-brand-gold/30">
            <Sparkles size={12} className="animate-spin" /> Commande Confirmée !
          </span>

          <h3 className="text-2xl font-black italic uppercase text-white mt-2 leading-none">
            Notification Active
          </h3>
          <p className="text-[10px] text-brand-gold font-mono font-bold mt-1">
            Référence commande : #{order.id}
          </p>
        </div>

        {/* 3 Notification Status Cards */}
        <div className="space-y-3 relative z-10 mb-6">
          
          {/* 1. NOTIFICATION VISUELLE ANIMÉE ET SONORE */}
          <div className="bg-gradient-to-r from-brand-orange/20 to-brand-gold/10 p-4 rounded-3xl border border-brand-orange/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shrink-0 animate-pulse">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs text-white uppercase italic flex items-center gap-1.5">
                  Alerte Sonore & Visuelle
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                </h4>
                <p className="text-[8px] text-white/70 font-bold">Signal sonore émis • Animation active</p>
              </div>
            </div>
            <button 
              onClick={replaySound}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-brand-gold rounded-xl transition-all active:scale-90"
              title="Rejouer le son"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* 2. NOTIFICATION RESTAURANT KHADY'S FOOD */}
          <div className="bg-green-950/60 p-4 rounded-3xl border border-green-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shrink-0">
                  <ChefHat size={20} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-green-300 uppercase italic">1. Restaurant Khady's Food</h4>
                  <p className="text-[8px] text-green-200/80 font-mono font-bold">{RESTAURANT_INFO.whatsapp}</p>
                </div>
              </div>
              <button 
                onClick={handleOpenRestaurantWhatsApp}
                className="bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Send size={12} /> Cuisine
              </button>
            </div>
          </div>

          {/* 3. NOTIFICATION LIVREUR BILLO EXPRESS */}
          <div className="bg-orange-950/60 p-4 rounded-3xl border border-brand-orange/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shrink-0">
                  <Bike size={20} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-brand-gold uppercase italic">2. Livreur Billo Express</h4>
                  <p className="text-[8px] text-brand-gold/80 font-mono font-bold">{BILLO_INFO.whatsapp}</p>
                </div>
              </div>
              <button 
                onClick={handleOpenBilloWhatsApp}
                className="bg-brand-orange hover:bg-brand-orange/80 text-white px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Send size={12} /> Livreur
              </button>
            </div>
          </div>

          {/* 4. LIGNE DIRECTE APPEL VOCAL */}
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shadow-lg shrink-0 border border-brand-gold/30">
                <PhoneCall size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs text-brand-gold uppercase italic">Ligne Directe Appels</h4>
                <p className="text-[8px] text-white/60 font-mono font-bold">{RESTAURANT_INFO.directLine}</p>
              </div>
            </div>
            <button
              onClick={handleDirectCall}
              className="bg-brand-gold text-brand-brown px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              Appeler
            </button>
          </div>

        </div>

        {/* Order Details Preview */}
        <div className="bg-black/40 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-2 mb-6 relative z-10 text-[10px]">
          <div className="flex justify-between text-white/50 uppercase font-black text-[8px]">
            <span>Client : {order.customerName}</span>
            <span>Tél : {order.phone}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-b border-white/5 pb-2">
            <span>Adresse ({order.district}) :</span>
            <span className="text-white/70 truncate max-w-[180px]">{order.address || 'Au restaurant'}</span>
          </div>
          <div className="pt-1">
            <p className="text-[8px] font-black text-brand-gold uppercase mb-1">Articles commandés :</p>
            <div className="space-y-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-white/80 font-mono text-[9px]">
                  <span>• {it.quantity}x {it.name}</span>
                  <span>{it.price * it.quantity} F</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="font-black uppercase text-white">Total Net à Payer :</span>
            <span className="text-sm font-black text-brand-gold">{order.total + order.deliveryFee} F CFA</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 relative z-10">
          <button 
            onClick={() => {
              playSound('pop');
              onClose();
              if (onTrackOrder) onTrackOrder();
            }}
            className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            Suivre ma commande en direct <ArrowRight size={16} />
          </button>

          {onOpenPushNotification && (
            <button 
              onClick={() => {
                playSound('pop');
                onOpenPushNotification();
              }}
              className="w-full bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-brown py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 border border-brand-gold/30 active:scale-95 transition-all"
            >
              <Bell size={14} className="animate-bounce" /> S'abonner aux Notifications Push Livreur 🔔
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="w-full bg-white/10 text-white/60 hover:text-white py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-colors"
          >
            Fermer l'alerte
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderNotificationModal;
