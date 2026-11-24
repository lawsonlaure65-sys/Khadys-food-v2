import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Clock, ChefHat, Bike, Phone, MessageSquare, MapPin, ArrowRight, XCircle } from 'lucide-react';
import { RESTAURANT_INFO } from '../constants';

interface TrackingProps {
  order: Order | null;
  onNewOrder: () => void;
}

const STATUS_TO_STEP: Record<Order['status'], number> = {
  received: 1,
  preparing: 2,
  on_delivery: 3,
  delivered: 4,
  cancelled: 0,
};

export const OrderTracking: React.FC<TrackingProps> = ({ order, onNewOrder }) => {
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

  const currentStep = STATUS_TO_STEP[order.status] ?? 1;
  const isCancelled = order.status === 'cancelled';

  const steps = [
    { num: 1, title: "Commande Reçue", desc: "Enregistrée & transmise", icon: <CheckCircle2 className="w-5 h-5" /> },
    { num: 2, title: "En Préparation", desc: "Cuisinée avec soin par Khady", icon: <ChefHat className="w-5 h-5" /> },
    { num: 3, title: "En Route dans Niamey", desc: `Livraison vers ${order.district}`, icon: <Bike className="w-5 h-5" /> },
    { num: 4, title: "Livrée", desc: "Bon appétit !", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const driverDisplay =
    order.driverName && !order.driverName.includes('Moussa (Livreur')
      ? order.driverName
      : "Service Livraison Khady's Food";
  const driverPhoneDisplay =
    order.driverPhone && order.driverPhone !== '+227 90 12 34 56' && order.driverPhone !== '+22790123456'
      ? order.driverPhone
      : RESTAURANT_INFO.phoneClean;

  const whatsappFollowUrl = `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour Khady's Food, je souhaite connaître l'avancement de ma commande #${order.id} (${order.customerName} - ${order.district}).`
  )}`;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1C1815] to-[#251E1A] border border-orange-500/25 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Suivi de commande
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">
              Commande #{order.id}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Destinataire : <strong className="text-stone-200">{order.customerName}</strong> • {order.phone}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-400">Délai moyen estimé</span>
            <div className="text-2xl font-black text-amber-400">
              ~{order.estimatedDeliveryMinutes || 35} min
            </div>
          </div>
        </div>

        {isCancelled ? (
          <div className="mt-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-200 text-sm">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>Cette commande a été annulée. Contactez le restaurant sur WhatsApp pour toute question.</span>
          </div>
        ) : (
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
        )}
      </div>

      {/* Delivery & assistance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#181615] border border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{driverDisplay}</h4>
              <p className="text-xs text-stone-400">{RESTAURANT_INFO.phone}</p>
            </div>
          </div>
          <a
            href={`tel:${driverPhoneDisplay}`}
            className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-md"
            title="Appeler le service livraison"
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
              <h4 className="text-sm font-bold text-white">Suivi direct WhatsApp</h4>
              <p className="text-xs text-stone-400">Confirmation & position en direct</p>
            </div>
          </div>
          <a
            href={whatsappFollowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
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
          {(order.items || []).map((ci, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-400">{ci.quantity || 1}x</span>
                <span className="text-white">{ci.item?.name || "Article Khady"}</span>
                {ci.spice && (
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                    {ci.spice}
                  </span>
                )}
              </div>
              <span className="font-semibold text-amber-400">
                {(((ci.item?.price || 0) * (ci.quantity || 1))).toLocaleString()} FCFA
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs text-stone-400">
          <div className="flex justify-between">
            <span>Frais de livraison ({order.district || "Niamey"})</span>
            <span className="text-stone-200">{(order.deliveryFee || 0).toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1">
            <span>Total réglé / à régler</span>
            <span className="text-amber-400 text-lg">{(order.totalAmount || 0).toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="pt-2 flex items-start gap-2 text-xs text-stone-400">
          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <span>{order.address || "Livraison Niamey"} ({order.district || "Plateau"}, Niamey)</span>
        </div>
      </div>
    </div>
  );
};
