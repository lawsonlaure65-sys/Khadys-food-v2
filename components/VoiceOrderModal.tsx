import React, { useState } from 'react';
import { Mic, MicOff, X, Sparkles, ShoppingBag, Volume2, Check } from 'lucide-react';
import { MenuItem } from '../types';

interface VoiceProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onAddToCart: (item: MenuItem, qty?: number) => void;
}

export const VoiceOrderModal: React.FC<VoiceProps> = ({
  isOpen,
  onClose,
  items,
  onAddToCart,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedItem, setMatchedItem] = useState<MenuItem | null>(null);

  if (!isOpen) return null;

  const quickVoicePhrases = [
    "Thiéboudienne rouge royal",
    "Dibi d'agneau grillé",
    "Pastels croustillants au thon",
    "Box 3 Sauces Khady",
    "Bissap frais maison"
  ];

  const handleSimulateVoice = (phrase: string) => {
    setIsListening(true);
    setTranscript(phrase);

    setTimeout(() => {
      setIsListening(false);
      const found = items.find(i => 
        i.name.toLowerCase().includes(phrase.toLowerCase().split(' ')[0]) ||
        phrase.toLowerCase().includes(i.name.toLowerCase().split(' ')[0])
      ) || items[0];

      setMatchedItem(found);
    }, 1200);
  };

  const handleConfirmOrder = () => {
    if (matchedItem) {
      onAddToCart(matchedItem, 1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#1B1512] border border-orange-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600/20 text-orange-400 border border-orange-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            IA Vocale Khady • Niamey
          </span>
          <h2 className="text-xl font-black text-white">Commande Vocale</h2>
          <p className="text-xs text-stone-400">
            Dictez votre plat préféré ou choisissez une commande rapide ci-dessous
          </p>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="py-4 flex justify-center">
          <button
            onClick={() => handleSimulateVoice("Dibi d'agneau grillé")}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-2xl shadow-red-500'
                : 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-orange-950/60 hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        {transcript && (
          <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800 text-sm">
            <span className="text-xs text-stone-400 block mb-1">Texte reconnu :</span>
            <span className="font-bold text-amber-300">« {transcript} »</span>
          </div>
        )}

        {matchedItem && (
          <div className="p-4 bg-orange-950/30 rounded-2xl border border-orange-500/30 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={matchedItem.image} 
                alt={matchedItem.name} 
                className="w-12 h-12 rounded-xl object-cover" 
              />
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{matchedItem.name}</h4>
                <span className="text-xs font-black text-amber-400">{matchedItem.price.toLocaleString()} FCFA</span>
              </div>
            </div>
            <button
              onClick={handleConfirmOrder}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-stone-400 block">Exemples vocaux fréquents :</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {quickVoicePhrases.map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleSimulateVoice(phrase)}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] border border-stone-800 transition-colors"
              >
                « {phrase} »
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
