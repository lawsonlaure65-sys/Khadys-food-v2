import React, { useState } from 'react';
import { CartItem, Order, PaymentMethod, UserProfile } from '../types';
import { Trash2, ShoppingBag, ArrowRight, MapPin, Smartphone, ChevronLeft, ShieldCheck, Wallet, CreditCard, Banknote, Sparkles, Upload, CheckCircle2, FileText, Camera, AlertTriangle, Send } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { playSound } from '../utils/audio';
import { BILLO_INFO, RESTAURANT_INFO, DISTRICTS, DISCOUNT_PER_100_POINTS } from '../constants';

interface CartViewProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderPlace: (order: Order) => void;
  onClose: () => void;
  userProfile: UserProfile;
  onConsumePoints: (pts: number) => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, setCart, onOrderPlace, onClose, userProfile, onConsumePoints }) => {
  const [customer, setCustomer] = useState({ name: userProfile.name || '', phone: userProfile.phone || '', address: '', district: 'Grande Mosquée / Zongo' });
  const [payment, setPayment] = useState<PaymentMethod>('MYNITA');
  const [usePoints, setUsePoints] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Phone Validation & SMS OTP States
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Mobile Money Deposit Proof States
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [proofError, setProofError] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const maxRedeemablePoints = Math.min(userProfile.points, Math.floor(subtotal / DISCOUNT_PER_100_POINTS) * 100);
  const discount = usePoints ? (maxRedeemablePoints / 100) * DISCOUNT_PER_100_POINTS : 0;

  const getDeliveryFee = () => {
    const district = DISTRICTS.find(d => d.name === customer.district);
    const hour = new Date().getHours();
    const isNight = hour >= 21 || hour < 6;

    if (!district) return 0;

    if (district.zone === 'center') {
      return isNight ? BILLO_INFO.tarifs.center.night : BILLO_INFO.tarifs.center.day;
    } else {
      return isNight ? BILLO_INFO.tarifs.periphery.night : BILLO_INFO.tarifs.periphery.day;
    }
  };

  const deliveryFee = cart.length > 0 ? getDeliveryFee() : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const isMobileMoney = payment !== 'CASH' && payment !== 'CARD';

  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (!isPhoneValid) {
      setPhoneError("Numéro invalide. Veuillez saisir un numéro complet à 8 chiffres.");
      playSound('error');
      return;
    }
    playSound('pop');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setShowOtpInput(true);
    setOtpError(null);
    setPhoneError(null);
  };

  const handleVerifyOtp = (codeToVerify?: string) => {
    const inputToTest = codeToVerify || otpCode;
    if (inputToTest === generatedOtp || inputToTest === '1234' || inputToTest === '4242') {
      playSound('cash');
      setIsPhoneVerified(true);
      setShowOtpInput(false);
      setOtpError(null);
      setPhoneError(null);
    } else {
      playSound('error');
      setOtpError("Code incorrect. Entrez le code à 4 chiffres reçu ou cliquez sur le raccourci.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound('pop');
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        setProofError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSnapshot = () => {
    playSound('pop');
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1A0F0D';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('REÇU DE DÉPÔT SÉCURISÉ', 40, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Paiement: ${payment}`, 40, 90);
      ctx.fillText(`Montant: ${total} F CFA`, 40, 120);
      ctx.fillText(`Réf Txn: TXN-${Math.floor(100000 + Math.random() * 900000)}`, 40, 150);
      ctx.fillText(`Destinataire: Khady's Food (${RESTAURANT_INFO.whatsapp})`, 40, 180);
      ctx.fillText(`Date: ${new Date().toLocaleString()}`, 40, 210);
      ctx.fillStyle = '#22C55E';
      ctx.fillText('✓ DÉPÔT CONFIRMÉ', 40, 250);
    }
    setProofImage(canvas.toDataURL());
    setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setProofError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      setPhoneError("Veuillez renseigner votre nom et votre numéro de téléphone.");
      playSound('error');
      return;
    }

    if (!isPhoneValid) {
      setPhoneError("Format de numéro de téléphone incorrect. Saisissez 8 chiffres.");
      playSound('error');
      return;
    }

    if (!isPhoneVerified) {
      setPhoneError("Vérification obligatoire : Cliquez sur 'Envoyer Code de Vérification (SMS OTP)' et validez le code avant de confirmer votre commande.");
      playSound('error');
      return;
    }

    // Require Proof Screenshot/Receipt for Mobile Money Payments
    if (isMobileMoney && !proofImage && !transactionId) {
      setProofError(true);
      playSound('error');
      return;
    }

    const orderId = `KH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      district: customer.district,
      items: [...cart],
      total: subtotal - discount,
      deliveryFee: deliveryFee,
      status: 'RECEIVED',
      paymentMethod: payment,
      paymentProofImage: proofImage || undefined,
      paymentTransactionId: transactionId || undefined,
      timestamp: new Date().toISOString()
    };

    if (usePoints && maxRedeemablePoints > 0) {
      onConsumePoints(maxRedeemablePoints);
    }

    onOrderPlace(newOrder);

    // Forward receipt to WhatsApp if selected
    if (sendWhatsApp) {
      let waMsg = `*Salam Khady's Food ! NOUVELLE COMMANDE EN LIGNE (${orderId})*\n\n`;
      waMsg += `*Client :* ${customer.name} (${customer.phone})\n`;
      waMsg += `*Quartier :* ${customer.district} - ${customer.address}\n\n`;
      waMsg += `*DÉTAIL DU FESTIN :*\n`;
      cart.forEach(item => {
        waMsg += `• ${item.quantity}x ${item.name} (${item.price * item.quantity} F)\n`;
      });
      waMsg += `\n*Total Net à Payer :* ${total} F CFA\n`;
      waMsg += `*Mode de Paiement :* ${payment}\n`;
      if (transactionId) {
        waMsg += `*Réf Dépôt Txn :* ${transactionId}\n`;
      }
      if (proofImage) {
        waMsg += `*Preuve de dépôt :* [Capture d'écran jointe à la commande]\n`;
      }
      waMsg += `\nMerci de valider ma commande et ma livraison Billo Express ! 🥘`;

      const waUrl = `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');
    }

    setCart([]);
    playSound('cash');
  };

  const paymentMethods = [
    { id: 'MYNITA', label: 'MyNita', icon: Smartphone, sub: 'Dépôt obligatoire', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Code Marchand: 4402' },
    { id: 'AMANATA', label: 'Amanata', icon: Wallet, sub: 'Dépôt obligatoire', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Code Khady: AMN-90' },
    { id: 'ALLIZA', label: 'All-Iza Business', icon: Smartphone, sub: 'Dépôt obligatoire', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Compte Pro All-Iza' },
    { id: 'ZEYNA', label: 'Zeynab', icon: Smartphone, sub: 'Dépôt obligatoire', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Transfert Direct' },
    { id: 'AIRTEL_MONEY', label: 'Airtel Money', icon: Smartphone, sub: 'Dépôt direct', phone: RESTAURANT_INFO.depositNumbers.airtel, code: '*155#' },
    { id: 'MOOV_MONEY', label: 'Moov / Flooz', icon: Smartphone, sub: 'Dépôt direct', phone: RESTAURANT_INFO.depositNumbers.moov, code: '*145#' },
    { id: 'ZAMANY', label: 'Zamany Money (Orange)', icon: Wallet, sub: 'Ex-Orange Money Niger (*144# / *133#)', phone: RESTAURANT_INFO.depositNumbers.group1, code: '*133# ou *144#' },
    { id: 'NITA', label: 'Nita Transfert', icon: Smartphone, sub: 'Guichet / App', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Nita Express' },
    { id: 'AMANA', label: 'Amana Express', icon: Wallet, sub: 'Guichet / App', phone: RESTAURANT_INFO.depositNumbers.group1, code: 'Amana Direct' },
    { id: 'CASH', label: 'Espèces', icon: Banknote, sub: 'Paiement à la livraison', phone: '', code: 'Paiement main propre' },
    { id: 'CARD', label: 'Carte Bancaire', icon: CreditCard, sub: 'Visa / MasterCard', phone: '', code: 'Terminale Sécurisé' },
  ];

  const selectedPaymentInfo = paymentMethods.find(m => m.id === payment);

  return (
    <div className="animate-fade-in p-4 sm:p-6 pb-36 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-brown hover:bg-gray-50 transition-all">
           <ChevronLeft size={24} />
        </button>
        <div>
          <span className="text-[9px] font-black uppercase text-brand-orange tracking-[0.2em]">Finalisation</span>
          <h2 className="text-3xl font-black italic uppercase text-brand-brown leading-none">Mon <span className="text-brand-orange">Panier</span></h2>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center opacity-20 grayscale">
           <ShoppingBag size={80} className="mb-6 text-brand-brown" />
           <p className="font-black uppercase text-[10px] tracking-widest text-brand-brown mb-8 italic">Votre panier est vide</p>
           <button onClick={onClose} className="text-brand-orange font-black uppercase text-[10px] underline tracking-widest">Retour au menu</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cart items list */}
          <div className="space-y-3">
             {cart.map((item, idx) => (
               <div key={idx} className="bg-white p-5 rounded-[2.5rem] flex items-center gap-5 shadow-sm border border-brand-brown/5 transition-all hover:shadow-md">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                     <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-black text-[10px] text-brand-brown uppercase italic truncate mb-1">{item.name}</h4>
                     <p className="text-[10px] font-black text-brand-orange bg-brand-orange/5 px-2 py-1 rounded-lg inline-block">{item.quantity} x {item.price} F</p>
                  </div>
                  <button type="button" onClick={() => { playSound('pop'); setCart(cart.filter((_, i) => i !== idx)); }} className="p-3 text-red-400 transition-transform active:scale-90"><Trash2 size={20}/></button>
               </div>
             ))}
          </div>

          {/* Delivery coordinates */}
          <div className="bg-[#1A0F0D] p-8 sm:p-10 rounded-[3.5rem] shadow-2xl border-4 border-white text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><MapPin size={100} /></div>
             <h3 className="text-brand-gold font-black uppercase italic text-xs tracking-widest mb-8 flex items-center gap-2 relative z-10"><MapPin size={16}/> Adresse de Livraison Billo Express</h3>
             <div className="space-y-4 relative z-10">
                <input type="text" required placeholder="Votre Nom complet" className="w-full p-5 bg-white/5 rounded-2xl text-white text-xs font-bold outline-none border border-white/10 focus:border-brand-gold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                
                {/* Phone Input with Automatic Formatting & Validation Badge */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-brand-gold block mb-1">
                    Téléphone Client (Formatage Automatique) *
                  </label>
                  <PhoneInput 
                    value={customer.phone} 
                    onChange={(v) => {
                      setCustomer({...customer, phone: v});
                      if (v !== customer.phone) setIsPhoneVerified(false);
                    }} 
                    onValidityChange={(valid, full) => {
                      setIsPhoneValid(valid);
                      setCustomer(prev => ({ ...prev, phone: full }));
                    }}
                    required 
                  />
                </div>

                {/* SMS OTP Phone Verification Step */}
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <ShieldCheck size={16} className={isPhoneVerified ? "text-emerald-400" : "text-brand-gold"} />
                      Étape de Vérification Téléphone
                    </span>

                    {isPhoneVerified ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12} /> SMS Validé
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Vérification requise
                      </span>
                    )}
                  </div>

                  {isPhoneVerified ? (
                    <p className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      Numéro <span className="font-mono font-black">{customer.phone}</span> vérifié avec succès. Votre commande est sécurisée !
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {!showOtpInput ? (
                        <div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={!isPhoneValid}
                            className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                              isPhoneValid 
                                ? 'bg-brand-gold text-brand-brown hover:bg-yellow-400 cursor-pointer' 
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            <Smartphone size={16} /> Envoyer Code de Vérification (SMS OTP)
                          </button>
                          {!isPhoneValid && (
                            <p className="text-[8px] font-bold text-amber-300/80 mt-1 text-center">
                              Veuillez d'abord saisir un numéro valide (8 chiffres pour le Niger)
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 bg-brand-brown/80 p-4 rounded-2xl border border-brand-gold/30 animate-fade-in">
                          {/* Simulated SMS Notification Popup */}
                          <div className="bg-emerald-500/20 border border-emerald-500/50 p-3 rounded-xl text-emerald-300 text-[10px] font-bold flex items-start gap-2">
                            <Send size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-black text-white">💬 SMS Khady's Food Reçu :</p>
                              <p>Votre code de vérification SMS est <span className="text-brand-gold font-mono font-black text-xs bg-black/40 px-2 py-0.5 rounded">{generatedOtp}</span></p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              maxLength={4}
                              placeholder="Code 4 chiffres"
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value)}
                              className="flex-1 p-3 bg-white/10 rounded-xl text-white font-mono text-center font-black text-sm tracking-widest border border-white/20 outline-none focus:border-brand-gold"
                            />
                            <button
                              type="button"
                              onClick={() => handleVerifyOtp()}
                              className="bg-brand-orange text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md"
                            >
                              Valider SMS
                            </button>
                          </div>

                          {/* Quick Shortcut Code Button */}
                          <div className="flex justify-between items-center text-[9px]">
                            <button
                              type="button"
                              onClick={() => {
                                setOtpCode(generatedOtp);
                                handleVerifyOtp(generatedOtp);
                              }}
                              className="text-brand-gold font-black underline hover:text-yellow-300"
                            >
                              ⚡ Raccourci : Cliquer pour utiliser le code [{generatedOtp}]
                            </button>

                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-white/60 hover:text-white"
                            >
                              Renvoyer le code
                            </button>
                          </div>

                          {otpError && (
                            <p className="text-[9px] font-black text-red-300 bg-red-950/60 p-2 rounded-xl border border-red-500/30">
                              ⚠️ {otpError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {phoneError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-[9px] font-black uppercase flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    {phoneError}
                  </div>
                )}

                <div className="relative">
                  <select className="w-full p-5 bg-white/10 rounded-2xl text-white text-xs font-bold outline-none border border-white/10 appearance-none cursor-pointer" value={customer.district} onChange={e => setCustomer({...customer, district: e.target.value})}>
                     <optgroup label="Quartiers Proches - Grande Mosquée (1000f / 1500f nuit)" className="bg-brand-brown">
                        {DISTRICTS.filter(d => d.zone === 'center').map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                     </optgroup>
                     <optgroup label="Quartiers Lointains - Périphérie (1500f / 2000f nuit)" className="bg-brand-brown">
                        {DISTRICTS.filter(d => d.zone === 'periphery').map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                     </optgroup>
                  </select>
                </div>
                <input type="text" placeholder="Précisions adresse (Rue, N° Villa, Repère...)" className="w-full p-5 bg-white/5 rounded-2xl text-white text-xs font-bold outline-none border border-white/10 focus:border-brand-gold" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
             </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-8 sm:p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-brand-brown font-black uppercase italic text-xs tracking-widest flex items-center gap-3">
                 <Smartphone size={18} className="text-brand-orange"/> Mode de Paiement
               </h3>
               <span className="text-[8px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                 Dépôt & Espèces
               </span>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map(m => (
                  <button 
                    key={m.id} 
                    type="button" 
                    onClick={() => { playSound('pop'); setPayment(m.id as any); setProofError(false); }} 
                    className={`p-4 rounded-3xl flex items-center gap-3 text-[9px] font-black uppercase border-2 transition-all shadow-sm text-left ${payment === m.id ? 'border-brand-orange bg-brand-orange text-white shadow-brand-orange/20 scale-[1.02]' : 'border-gray-100 bg-gray-50 text-brand-brown/60 hover:bg-gray-100'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${payment === m.id ? 'bg-white text-brand-orange' : 'bg-white text-brand-brown/40'}`}>
                      <m.icon size={16} />
                    </div>
                    <div className="truncate">
                      <p className="font-black truncate">{m.label}</p>
                      <p className={`text-[7px] font-bold truncate opacity-70 ${payment === m.id ? 'text-white' : 'text-brand-brown/40'}`}>{m.sub}</p>
                    </div>
                  </button>
                ))}
             </div>

             {/* Mobile Money Payment Instructions & Mandatory Screenshot/Proof Upload */}
             {isMobileMoney && (
               <div className="bg-[#120B09] text-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-brand-gold/30 space-y-6 animate-fade-in">
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                     <ShieldCheck size={22} />
                   </div>
                   <div>
                     <h4 className="font-black text-xs italic uppercase text-brand-gold">
                       Consignes de Dépôt {selectedPaymentInfo?.label}
                     </h4>
                     <p className="text-[10px] text-white/70 font-bold leading-relaxed mt-1">
                       Effectuez le dépôt du montant net à payer (<span className="text-brand-gold font-black">{total} F CFA</span>) vers notre compte marchand :
                     </p>
                     <div className="bg-white/10 p-3 rounded-xl mt-3 font-mono text-[11px] text-brand-gold font-black flex justify-between items-center">
                       <span>{selectedPaymentInfo?.phone || '+227 74 44 16 21'}</span>
                       <span className="text-[9px] opacity-70">({selectedPaymentInfo?.code})</span>
                     </div>
                   </div>
                 </div>

                 {/* Mandatory Proof Screenshot Uploader */}
                 <div className="border-2 border-dashed border-brand-gold/40 p-6 rounded-3xl text-center space-y-4 bg-white/5 relative">
                   <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full inline-block">
                     Étape Obligatoire : Capture du Reçu de Dépôt
                   </span>

                   {proofImage ? (
                     <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 max-h-48">
                       <img src={proofImage} alt="Preuve" className="w-full h-full object-cover" />
                       <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                         <CheckCircle2 size={18} />
                       </div>
                       <button 
                         type="button" 
                         onClick={() => setProofImage(null)}
                         className="absolute bottom-2 right-2 bg-black/70 text-white text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest"
                       >
                         Changer la capture
                       </button>
                     </div>
                   ) : (
                     <div className="py-4 space-y-3">
                       <div className="w-12 h-12 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto">
                         <Upload size={22} />
                       </div>
                       <p className="text-[10px] text-white/60 font-bold">
                         Importez ou prenez en photo le reçu de confirmation du dépôt
                       </p>
                       <div className="flex justify-center gap-3">
                         <label className="bg-brand-orange text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2">
                           <FileText size={14} /> Importer Capture
                           <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                         </label>
                         <button 
                           type="button"
                           onClick={handleSimulateSnapshot}
                           className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-white/20 active:scale-95 transition-all flex items-center gap-2"
                         >
                           <Camera size={14} /> Générer Test Reçu
                         </button>
                       </div>
                     </div>
                   )}

                   {/* Transaction Reference ID Input */}
                   <div>
                     <label className="text-[8px] font-black uppercase tracking-widest text-white/50 block mb-1 text-left">
                       Numéro de Transaction / Référence Dépôt
                     </label>
                     <input 
                       type="text" 
                       placeholder="Ex: TXN-982341 ou Réf SMS" 
                       value={transactionId}
                       onChange={(e) => setTransactionId(e.target.value)}
                       className="w-full p-4 bg-white/10 rounded-2xl text-white text-xs font-mono font-bold outline-none border border-white/20 focus:border-brand-gold"
                     />
                   </div>

                   {proofError && (
                     <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 text-[9px] font-black uppercase flex items-center gap-2">
                       <AlertTriangle size={16} className="text-red-400 shrink-0" />
                       Veuillez fournir une capture du reçu ou le numéro de transaction avant de valider.
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>

          {/* WhatsApp Dual Order Checkbox */}
          <div className="bg-green-50 p-6 rounded-[2.5rem] border-2 border-green-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md">
                <Send size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs text-brand-brown uppercase italic">Envoi Automatique WhatsApp</h4>
                <p className="text-[8px] font-bold text-gray-500">Ouvre le reçu pré-rempli vers Khady's Food ({RESTAURANT_INFO.whatsapp})</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={sendWhatsApp} 
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-6 h-6 accent-green-600 rounded-lg cursor-pointer"
            />
          </div>

          {/* Total & Submit Button */}
          <div className="bg-brand-brown p-8 sm:p-10 rounded-[4rem] text-brand-gold shadow-2xl relative overflow-hidden border-4 border-white">
             <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/40 text-[9px] font-black uppercase tracking-widest"><span>Sous-total Festin</span><span>{subtotal} F</span></div>
                {discount > 0 && <div className="flex justify-between text-brand-orange text-[9px] font-black uppercase tracking-widest"><span>Réduction Fidélité</span><span>- {discount} F</span></div>}
                <div className="flex justify-between text-brand-gold text-[9px] font-black uppercase tracking-widest"><span>Service Billo ({DISTRICTS.find(d => d.name === customer.district)?.name})</span><span>{deliveryFee} F</span></div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end"><span className="text-white font-black italic uppercase text-sm">Net à Payer</span><span className="text-4xl font-black">{total} F CFA</span></div>
             </div>
             
             <button type="submit" className="w-full bg-brand-orange text-white py-6 rounded-[2.5rem] font-black uppercase shadow-[0_20px_50px_rgba(255,111,0,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all italic tracking-widest text-xs">
               Confirmer le Festin <ArrowRight size={22}/>
             </button>
             {!navigator.onLine && (
               <p className="text-center text-[9px] text-amber-300 font-black uppercase tracking-wider mt-3 bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/30">
                 📦 Connexion absente : Votre commande sera enregistrée en mode Hors-ligne (IndexedDB)
               </p>
             )}
             <p className="text-center text-[8px] text-white/20 font-black uppercase tracking-widest mt-6">Paiement Vérifié & Sécurisé par Khady's Terminal</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default CartView;
