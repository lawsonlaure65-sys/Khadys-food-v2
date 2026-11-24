import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Check, Search } from 'lucide-react';
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
  const [noMatchMsg, setNoMatchMsg] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const findBestMatchingDish = (phrase: string): MenuItem | null => {
    const clean = (phrase || '').toLowerCase().trim();
    if (!clean) return null;

    const words = clean.split(/\s+/).filter(w => w.length > 2);
    const availableItems = (items || []).filter(i => i && i.available !== false);

    let bestItem: MenuItem | null = null;
    let bestScore = 0;

    for (const item of availableItems) {
      const name = String(item.name || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      if (name === clean) return item;

      let score = 0;
      if (name.includes(clean)) score += 10;
      for (const word of words) {
        if (name.includes(word)) score += 3;
        else if (desc.includes(word)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    return bestScore >= 2 ? bestItem : null;
  };

  const applyPhrase = (phrase: string) => {
    setTranscript(phrase);
    setNoMatchMsg(null);
    setSpeechError(null);
    const found = findBestMatchingDish(phrase);
    setMatchedItem(found);
    if (!found && phrase.trim().length > 1) {
      setNoMatchMsg(`Aucun plat correspondant à « ${phrase} ». Essayez un autre nom (ex: Tiep, Dibi, Pastels, Doukounou, Bissap).`);
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopRecognition();
    }
    return () => {
      stopRecognition();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickVoicePhrases = [
    "Tiep Rouge Royal",
    "Dibi d'agneau",
    "Pastels",
    "Box Sauces",
    "Bissap"
  ];

  const handleToggleListening = () => {
    if (isListening) {
      stopRecognition();
      return;
    }

    setSpeechError(null);
    setNoMatchMsg(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("La reconnaissance vocale du navigateur n'est pas prise en charge sur cet appareil. Tapez votre plat ci-dessous ou choisissez un raccourci.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event?.results?.[0]?.[0]?.transcript || '';
        setIsListening(false);
        if (spoken) {
          applyPhrase(spoken);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'not-allowed') {
          setSpeechError("Accès au microphone refusé. Autorisez le micro ou saisissez le nom du plat ci-dessous.");
        } else {
          setSpeechError("Impossible de capter votre voix. Réessayez ou tapez votre recherche ci-dessous.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError("Reconnaissance vocale indisponible. Utilisez le champ de recherche ci-dessous.");
    }
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
        className="relative w-full max-w-md bg-[#1B1512] border border-orange-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-5"
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
            Commande Vocale • Niamey
          </span>
          <h2 className="text-xl font-black text-white">Dicter ou Rechercher un Plat</h2>
          <p className="text-xs text-stone-400">
            Appuyez sur le micro pour dicter en français, ou saisissez le nom du plat souhaité
          </p>
        </div>

        {/* Mic Circle */}
        <div className="py-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-2xl shadow-red-500'
                : 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-orange-950/60 hover:scale-105'
            }`}
            title={isListening ? 'Arrêter la dictée' : 'Activer le micro'}
          >
            {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
          </button>
          <span className="text-[11px] font-bold text-stone-400">
            {isListening ? 'Écoute en cours... parlez maintenant' : 'Appuyez pour dicter'}
          </span>
        </div>

        {/* Direct text search fallback */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={transcript}
            onChange={(e) => applyPhrase(e.target.value)}
            placeholder="Ou tapez un plat (ex: Tiep, Yassa, Attiéké...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {speechError && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 text-left">
            {speechError}
          </div>
        )}

        {noMatchMsg && !matchedItem && (
          <div className="p-3 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-300 text-left">
            {noMatchMsg}
          </div>
        )}

        {matchedItem && (
          <div className="p-4 bg-orange-950/30 rounded-2xl border border-orange-500/30 text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={matchedItem.image}
                alt={matchedItem.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white line-clamp-1">{matchedItem.name}</h4>
                <span className="text-xs font-black text-amber-400">{matchedItem.price.toLocaleString()} FCFA</span>
              </div>
            </div>
            <button
              onClick={handleConfirmOrder}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 flex-shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-stone-400 block">Recherches rapides :</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {quickVoicePhrases.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPhrase(phrase)}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] border border-stone-800 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
