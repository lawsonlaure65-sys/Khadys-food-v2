import React, { useState } from 'react';
import { CartItem, Order, PaymentMethod } from '../types';
import { RESTAURANT_INFO } from '../constants';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, MapPin, Phone, User, CheckCircle2, MessageSquare } from 'lucide-react';
import { generateWhatsAppOrderLink } from '../utils/whatsapp';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CartView: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onClose,
  onOrderPlaced,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(RESTAURANT_INFO.deliveryDistricts[0].name);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const currentDistrictObj = RESTAURANT_INFO.deliveryDistricts.find(d => d.name === district) || RESTAURANT_INFO.deliveryDistricts[0];
  const deliveryFee = items.length > 0 ? currentDistrictObj.fee : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleCheckout = (viaWhatsApp = false) => {
    if (items.length === 0) return;
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError("Veuillez renseigner votre nom pour la livraison.");
      return;
    }
    if (!phone.trim()) {
      setValidationError("Veuillez renseigner votre numéro de téléphone (Airtel / Moov).");
      return;
    }

    setIsSubmitting(true);

    const newOrder: Order = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      district,
      address: address.trim() || `Livraison à ${district}, Niamey`,
      items: [...items],
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      status: 'received',
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: 35,
      driverName: "Moussa (Livreur Khady)",
      driverPhone: "+227 90 12 34 56",
      notes: notes.trim() || undefined
    };

    onOrderPlaced(newOrder);

    if (viaWhatsApp) {
      const waLink = generateWhatsAppOrderLink(newOrder);
      window.open(waLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#181615] border border-orange-500/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#141211] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Votre Panier Gourmand</h2>
              <p className="text-xs text-stone-400">
                {items.length} {items.length > 1 ? 'articles sélectionnés' : 'article sélectionné'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-stone-800/80 flex items-center justify-center text-stone-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Votre panier est encore vide</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Découvrez nos plats signatures, nos pastels croustillants ou nos box sauces artisanales !
              </p>
            </div>
          ) : (
            <>
              {/* Item list */}
              <div className="space-y-3">
                {items.map((cartItem, idx) => (
                  <div
                    key={`${cartItem.item.id}-${idx}`}
                    className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800/80 flex items-center gap-3"
                  >
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-950 flex-shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {cartItem.item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">
                          {(cartItem.item.price * cartItem.quantity).toLocaleString()} FCFA
                        </span>
                        {cartItem.spice && (
                          <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[10px] text-orange-300">
                            Piment: {cartItem.spice}
                          </span>
                        )}
                      </div>
                      {cartItem.notes && (
                        <p className="text-[11px] text-stone-500 truncate mt-0.5 italic">
                          "{cartItem.notes}"
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-stone-800 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(idx, cartItem.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-white">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, cartItem.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div className="pt-4 border-t border-stone-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  Adresse de livraison à Niamey
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-400 mb-1 block">
                      Votre nom complet *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Hadiza Mamane"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-400 mb-1 block">
                      Numéro de téléphone (Airtel / Moov) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: +227 96 12 34 56"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-400 mb-1 block">
                      Quartier à Niamey
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      {RESTAURANT_INFO.deliveryDistricts.map(d => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.fee.toLocaleString()} FCFA)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-400 mb-1 block">
                      Précision de l'adresse / Repère
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Près de la pharmacie, Villa n°42"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 mb-1.5 block">
                    Mode de règlement
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'cash', label: 'Espèces', desc: 'À la livraison' },
                      { id: 'airtel', label: 'Airtel Money', desc: 'Niger' },
                      { id: 'moov', label: 'Moov Money', desc: 'Flooz' },
                      { id: 'card', label: 'Carte Bancaire', desc: 'Sécurisé' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{pm.label}</div>
                        <div className="text-[10px] text-stone-400">{pm.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with totals & order buttons */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#141211] border-t border-stone-800 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Sous-total plats</span>
                <span className="text-stone-200 font-semibold">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison ({district})</span>
                <span className="text-stone-200 font-semibold">{deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-stone-800">
                <span>Total à régler</span>
                <span className="text-amber-400 text-lg font-black">{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                ⚠️ {validationError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* WhatsApp instant checkout */}
              <button
                type="button"
                onClick={() => handleCheckout(true)}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>

              {/* Direct Web Order */}
              <button
                type="button"
                onClick={() => handleCheckout(false)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider & Suivre en direct</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
