import React, { useState } from 'react';
import { FaqItem } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, PhoneCall, Sparkles, ShieldCheck } from 'lucide-react';
import { playSound } from '../utils/audio';

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Paiement',
    question: 'Quels sont les modes de paiement Mobile Money acceptés ?',
    answer: 'Nous acceptons MyNita, Nita transfert, Amanata, Amana transfert, All-Iza Business, Zamany Money (+227 90 40 51 18), Airtel Money (+227 96 05 23 10), et Moov Money / Flooz (+227 74 44 16 21). Pour valider votre commande en Mobile Money, effectuez simplement le dépôt sur le numéro correspondant puis joignez la capture du reçu dans le formulaire de commande.'
  },
  {
    id: 'f2',
    category: 'Paiement',
    question: 'Puis-je payer en espèces à la livraison ?',
    answer: 'Oui tout à fait ! Le paiement en espèces à la livraison est disponible pour tous les quartiers de Niamey servis par nos livreurs partenaires Billo Express.'
  },
  {
    id: 'f3',
    category: 'Livraison',
    question: 'Quels sont les tarifs et délais de livraison Billo Express ?',
    answer: 'Depuis notre restaurant situé à la Grande Mosquée Muamar Kadafi, les quartiers proches (Grande Mosquée, Zongo, Boukoki, Wadata, Poudrière, Lacouroussou, Terminus, Plateau, Yantala, etc.) sont livrés à 1000 F en journée et 1500 F la nuit. Les quartiers lointains (Kouara Kano, Bobiel, Goudel, Niamey 2000, Aéroport, Saga, Kirkissoye, etc.) sont à 1500 F le jour et 2000 F la nuit. Les délais moyens sont de 25 à 45 minutes.'
  },
  {
    id: 'f4',
    category: 'Commandes',
    question: 'Comment fonctionne la commande sur WhatsApp ?',
    answer: 'Lorsque vous finalisez votre panier, cochez "Envoi Automatique WhatsApp". Votre commande et le reçu pré-rempli s\'ouvriront automatiquement dans WhatsApp vers le numéro officiel de Khady\'s Food (+227 74 44 16 21) pour une confirmation directe.'
  },
  {
    id: 'f5',
    category: 'Traiteur',
    question: 'Comment réserver un service Traiteur ou Buffet pour un mariage/événement ?',
    answer: 'Rendez-vous dans la section "Event & Traiteur" de l\'application ou sélectionnez un "Pack-Buffet". Nous demandons un préavis minimum de 72 heures et un acompte de 50% pour bloquer la date de votre événement.'
  },
  {
    id: 'f6',
    category: 'Fidélité',
    question: 'Comment accumuler des points de fidélité et parrainer des proches ?',
    answer: 'Chaque tranche de 1000 F dépensée sur l\'application vous rapporte 100 Points de Fidélité. 100 points équivalent à 100 F de réduction directe. Vous pouvez également partager votre Code de Parrainage depuis l\'onglet "Moi" : chaque filleul inscrit avec votre code vous gagne 500 Points Bonus !'
  }
];

interface FaqViewProps {
  faqs?: FaqItem[];
  onNavigateToWhatsApp: () => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ faqs = INITIAL_FAQS, onNavigateToWhatsApp }) => {
  const [openId, setOpenId] = useState<string | null>('f1');
  const [activeCategory, setActiveCategory] = useState<string>('TOUT');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['TOUT', 'Paiement', 'Livraison', 'Commandes', 'Traiteur', 'Fidélité'];

  const filtered = faqs.filter(item => {
    const matchesCategory = activeCategory === 'TOUT' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    playSound('pop');
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pb-36 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black uppercase text-brand-orange tracking-[0.3em] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="animate-pulse" /> Centre d'Aide & FAQ
          </span>
          <h2 className="text-3xl font-black italic uppercase text-brand-brown leading-none">
            QUESTIONS <span className="text-brand-orange">FREQUENTES</span>
          </h2>
        </div>
        <div className="w-12 h-12 bg-brand-brown text-brand-gold rounded-2xl flex items-center justify-center shadow-lg">
          <HelpCircle size={22} />
        </div>
      </header>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher une réponse (ex: MyNita, livraison, points...)" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-13 pr-5 py-4 rounded-2xl border border-gray-100 shadow-sm text-xs font-bold text-brand-brown outline-none focus:border-brand-orange transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { playSound('pop'); setActiveCategory(cat); }}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-brand-brown text-brand-gold shadow-lg scale-105' 
                : 'bg-white text-brand-brown/60 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => toggleItem(item.id)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-black uppercase bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-md shrink-0">
                    {item.category}
                  </span>
                  <h3 className="font-black text-xs uppercase italic text-brand-brown leading-snug">
                    {item.question}
                  </h3>
                </div>
                <div className={`p-2 rounded-xl text-brand-brown shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-orange text-white' : 'bg-gray-100'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-xs text-gray-600 font-medium leading-relaxed border-t border-gray-50 animate-fade-in">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-gradient-to-r from-brand-brown to-[#2C1814] text-white p-8 rounded-[3rem] shadow-2xl border-2 border-brand-gold/30 text-center space-y-4">
        <h3 className="text-xl font-black italic uppercase text-brand-gold">
          Une autre question ?
        </h3>
        <p className="text-xs text-white/70 font-bold max-w-md mx-auto">
          Notre équipe à Niamey est à votre écoute 7j/7 pour vous assister.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button 
            onClick={onNavigateToWhatsApp}
            className="bg-green-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase italic shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <MessageSquare size={16} /> WhatsApp (+227 74 44 16 21)
          </button>
          <a 
            href="tel:+22796052310" 
            className="bg-white/10 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase italic hover:bg-white/20 flex items-center justify-center gap-2 transition-all border border-white/20"
          >
            <PhoneCall size={16} /> Appeler (+227 96 05 23 10)
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqView;
