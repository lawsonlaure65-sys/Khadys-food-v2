import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { CheckCircle2, Clock, ChefHat, Bike, Phone, MessageSquare, MapPin, ArrowRight } from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface TrackingProps {
  order: Order | null;
  onNewOrder: () => void;
}

export const OrderTracking: React.FC<TrackingProps> = ({ order, onNewOrder }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Progressive delivery simulation for delightful UX
  useEffect(() => {
    if (!order) return;
    const t1 = setTimeout(() => setCurrentStep(2), 6000);
    const t2 = setTimeout(() => setCurrentStep(3), 18000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [order]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Aucune commande active</h2>
        <p className="text-sm text-stone-400 mt-2">
          Vous n'avez pas encore passé de commande ou votre précédente commande a été archivée.
        </p>
        <button
          onClick={onNewOrder}
          className="mt-6 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm inline-flex items-center gap-2"
        >
          <span>Découvrir la carte</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const steps = [
    { num: 1, title: "Commande Reçue", desc: "Validée par le restaurant", icon: <CheckCircle2 className="w-5 h-5" /> },
    { num: 2, title: "En Préparation", desc: "Mijoté avec passion par Khady", icon: <ChefHat className="w-5 h-5" /> },
    { num: 3, title: "En Route dans Niamey", desc: `Livraison vers ${order.district}`, icon: <Bike className="w-5 h-5" /> },
    { num: 4, title: "Livrée", desc: "Bon appétit !", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1C1815] to-[#251E1A] border border-orange-500/25 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Suivi en direct
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Commande #{order.id}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Destinataire : <strong className="text-stone-200">{order.customerName}</strong> • {order.phone}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-400">Temps estimé d'arrivée</span>
            <div className="text-2xl font-black text-amber-400">~25-35 min</div>
          </div>
        </div>

        {/* Step tracker */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((st) => {
            const isDone = currentStep >= st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300 ring-2 ring-orange-500/20'
                    : isDone
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                    : 'bg-stone-900/50 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Étape {st.num}</span>
                  {st.icon}
                </div>
                <h4 className="text-xs font-bold text-white truncate">{st.title}</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver info & assistance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#181615] border border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{order.driverName || "Moussa (Livreur Khady)"}</h4>
              <p className="text-xs text-stone-400">Livreur dédié Niamey</p>
            </div>
          </div>
          <a
            href={`tel:${order.driverPhone || "+22790123456"}`}
            className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-md"
            title="Appeler le livreur"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-[#181615] border border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Service Client Khady</h4>
              <p className="text-xs text-stone-400">Assistance WhatsApp 7j/7</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white border border-stone-700"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Order Summary Recap */}
      <div className="p-6 rounded-2xl bg-[#181615] border border-stone-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300">
          Articles de votre commande
        </h3>

        <div className="divide-y divide-stone-800/80">
          {order.items.map((ci, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-400">{ci.quantity}x</span>
                <span className="text-white">{ci.item.name}</span>
                {ci.spice && (
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                    {ci.spice}
                  </span>
                )}
              </div>
              <span className="font-semibold text-amber-400">
                {(ci.item.price * ci.quantity).toLocaleString()} FCFA
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs text-stone-400">
          <div className="flex justify-between">
            <span>Frais de livraison ({order.district})</span>
            <span className="text-stone-200">{order.deliveryFee.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1">
            <span>Total réglé / à régler</span>
            <span className="text-amber-400 text-lg">{order.totalAmount.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="pt-2 flex items-start gap-2 text-xs text-stone-400">
          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <span>{order.address} ({order.district}, Niamey)</span>
        </div>
      </div>
    </div>
  );
};
