import React, { useState, useMemo } from 'react';
import { 
  Zap, Tag, Megaphone, Send, Sparkles, Plus, Trash2, Edit3, 
  CheckCircle2, Copy, Share2, MessageSquare, Flame, Clock, 
  Users, Gift, ShoppingBag, ArrowRight, RefreshCw, Smartphone, 
  Layers, Sliders, Check, ShieldCheck, AlertCircle, Percent, DollarSign,
  Eye, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import { MenuItem, Order } from '../types';
import { playSound } from '../utils/audio';
import { GoogleGenAI } from '@google/genai';
import { 
  PromoCode, AnnouncementBanner, FlashDealConfig,
  getStoredPromoCodes, saveStoredPromoCodes,
  getStoredBanner, saveStoredBanner,
  getStoredFlashDeal, saveStoredFlashDeal,
  MARKETING_TEMPLATES, broadcastToWhatsApp
} from '../utils/marketing';
import { RESTAURANT_INFO } from '../constants';

interface AdminMarketingCenterProps {
  items: MenuItem[];
  orders: Order[];
  onItemsChange?: (items: MenuItem[]) => void;
}

export const AdminMarketingCenter: React.FC<AdminMarketingCenterProps> = ({ 
  items, 
  orders,
  onItemsChange 
}) => {
  // Active sub-tab inside Marketing
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'PROMO_CODES' | 'BANNER' | 'FLASH_DEALS' | 'CLIENTS_CRM' | 'AI_STRATEGY'>('CAMPAIGNS');

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => getStoredPromoCodes());
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({
    code: '',
    type: 'PERCENT',
    value: 15,
    minOrder: 4000,
    isActive: true,
    description: '',
    expiryDate: '2026-12-31'
  });

  // Announcement Banner State
  const [banner, setBanner] = useState<AnnouncementBanner>(() => getStoredBanner());
  const [bannerSaved, setBannerSaved] = useState(false);

  // Flash Deal State
  const [flashDeal, setFlashDeal] = useState<FlashDealConfig>(() => getStoredFlashDeal());
  const [flashSaved, setFlashSaved] = useState(false);

  // Campaign Composer State
  const [selectedTemplate, setSelectedTemplate] = useState(MARKETING_TEMPLATES[0]);
  const [campaignTitle, setCampaignTitle] = useState(MARKETING_TEMPLATES[0].title);
  const [campaignText, setCampaignText] = useState(MARKETING_TEMPLATES[0].bodyText);
  const [targetPhone, setTargetPhone] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // AI Insights State
  const [aiStrategyResult, setAiStrategyResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Unique Customer list derived from actual Orders
  const customerAudience = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; district: string; ordersCount: number; totalSpent: number; lastOrderDate: string }>();
    
    orders.forEach(o => {
      if (o.phone) {
        const clean = o.phone.trim();
        const existing = map.get(clean);
        const orderTotal = (o.total || 0) + (o.deliveryFee || 0);
        if (existing) {
          existing.ordersCount += 1;
          existing.totalSpent += orderTotal;
          if (new Date(o.timestamp) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = o.timestamp;
          }
        } else {
          map.set(clean, {
            name: o.customerName || 'Client Khady',
            phone: clean,
            district: o.district || 'Niamey',
            ordersCount: 1,
            totalSpent: orderTotal,
            lastOrderDate: o.timestamp || new Date().toISOString()
          });
        }
      }
    });

    // If no orders yet, populate 3 representative regular VIP customers for Niamey
    if (map.size === 0) {
      map.set('+227 70 03 25 52', { name: 'Mme Lawson Laure', phone: '+227 70 03 25 52', district: 'Plateau', ordersCount: 7, totalSpent: 48500, lastOrderDate: '2026-08-12' });
      map.set('+227 96 11 22 33', { name: 'Ibrahim Oumarou', phone: '+227 96 11 22 33', district: 'Koubia / Francophonie', ordersCount: 4, totalSpent: 26000, lastOrderDate: '2026-08-10' });
      map.set('+227 89 44 55 66', { name: 'Aïssata Diallo', phone: '+227 89 44 55 66', district: 'Recasement', ordersCount: 3, totalSpent: 19500, lastOrderDate: '2026-08-08' });
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Handle Promo Code CRUD
  const handleTogglePromo = (id: string) => {
    playSound('pop');
    const updated = promoCodes.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    setPromoCodes(updated);
    saveStoredPromoCodes(updated);
  };

  const handleDeletePromo = (id: string) => {
    playSound('pop');
    const updated = promoCodes.filter(p => p.id !== id);
    setPromoCodes(updated);
    saveStoredPromoCodes(updated);
  };

  const handleSaveNewPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.value) return;

    playSound('cash');
    const created: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newPromo.code.toUpperCase().trim(),
      type: newPromo.type || 'PERCENT',
      value: Number(newPromo.value),
      minOrder: Number(newPromo.minOrder || 0),
      isActive: true,
      usageCount: 0,
      description: newPromo.description || `Réduction de ${newPromo.value}${newPromo.type === 'PERCENT' ? '%' : ' F CFA'}`,
      expiryDate: newPromo.expiryDate || '2026-12-31'
    };

    const updated = [created, ...promoCodes];
    setPromoCodes(updated);
    saveStoredPromoCodes(updated);
    setShowAddPromoModal(false);
    setNewPromo({
      code: '',
      type: 'PERCENT',
      value: 15,
      minOrder: 4000,
      isActive: true,
      description: '',
      expiryDate: '2026-12-31'
    });
  };

  // Handle Banner Update
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('cash');
    saveStoredBanner(banner);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 3000);
  };

  // Handle Flash Deal Update
  const handleSaveFlashDeal = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('cash');
    saveStoredFlashDeal(flashDeal);
    setFlashSaved(true);
    setTimeout(() => setFlashSaved(false), 3000);
  };

  // Copy text to clipboard
  const handleCopyCampaign = () => {
    playSound('pop');
    navigator.clipboard.writeText(campaignText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Broadcast to WhatsApp Status or Phone
  const handleBroadcast = (target?: string) => {
    playSound('pop');
    broadcastToWhatsApp(campaignText, target || targetPhone);
  };

  // AI Copywriting Generator with Gemini
  const handleGenerateAiCopy = async (topic: string) => {
    setIsAiGenerating(true);
    playSound('pop');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Tu es le Responsable Marketing digital de « Khady's Food & Event » à Niamey (Niger).
Rédige un message promotionnel WhatsApp ultra-percutant, chaleureux et persuasif pour : "${topic}".
Contraintes :
- Utilise des emojis attractifs (🍲, 🔥, 🛵, ✨, 🎁, 👑).
- Mentionne les spécialités (Tiep Royal, Box Sauces, Dibi d'Agneau, Couscous, Jus Bissap).
- Indique le partenaire de livraison Billo Express.
- Inclut un appel à l'action clair avec lien WhatsApp.
- Longueur : 12-16 lignes bien aérées avec des puces. En français.`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (res.text) {
        setCampaignText(res.text);
        playSound('success');
      }
    } catch (err) {
      // High-quality fallback template if offline or no API key
      const fallback = `*🔥 OFFRE EXCLUSIVE DU JOUR — KHADY'S FOOD NIAMEY !* 🥘✨\n\n` +
        `Chers gourmets de Niamey, Cheffe Khady vous a concocté un menu royal aujourd'hui :\n` +
        `• *Tiep Royal au Poisson Frais & Légumes fondants*\n` +
        `• *Grillades Suya d'Agneau au Feu de Bois*\n` +
        `• *Box Sauce Gombo Royal & Viande de Bœuf*\n\n` +
        `🎁 *Offre Flash :* -20% sur votre commande avec le code *FLASH20* !\n` +
        `🛵 Livraison express et soignée dans tout Niamey assurée par *Billo Express*.\n\n` +
        `📲 Commandez dès maintenant en 1 clic : https://wa.me/${RESTAURANT_INFO.whatsappClean}\n` +
        `_Khady's Food & Event — Le goût de l'excellence._`;
      setCampaignText(fallback);
      playSound('success');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Run AI Sales Strategy
  const handleRunAiAudit = async () => {
    setAiLoading(true);
    playSound('pop');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `En tant qu'expert en stratégie marketing pour restaurants et traiteurs à Niamey au Niger :
Analyse le catalogue de Khady's Food (Tiep, Box Sauces, Buffets, Dibi, Jus naturels) et propose :
1. 3 Actions Marketing immédiates à fort impact pour la semaine (Vente Flash midi, Offre Entreprise buffet, Package famille weekend).
2. Le canal de diffusion recommandé (Statut WhatsApp, Groupes de quartiers Plateau/Koubia, Facebook).
3. Le meilleur code promo à lancer pour augmenter le panier moyen.
Sois précis, concret, orienté chiffre d'affaires et rédigé avec professionnalisme.`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiStrategyResult(res.text || '');
      playSound('success');
    } catch (e) {
      setAiStrategyResult(
        `💡 **PLAN D'ACTION MARKETING RECOMMANDÉ POUR CETTE SEMAINE :**\n\n` +
        `1. **Ventes Flash Déjeuner (11h30 - 13h30) :** Diffusez le Tiep Royal sur les statuts WhatsApp avec le code **KHADY24** (-15%). Ciblez les travailleurs de bureau à Plateau et Recasement.\n\n` +
        `2. **Campagne Buffets Entreprises :** Contactez les secrétariats et comités d'entreprises pour les séminaires avec l'offre **Pack Buffet Prestige** (-15% avec le code **BUFFETPRO**).\n\n` +
        `3. **Offre Week-end Grillades Dibi :** Lancez la promotion Dibi d'Agneau au feu de bois le vendredi soir avec 1 bouteille de Bissap glacé offerte pour dynamiser les commandes familiales.`
      );
      playSound('success');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      
      {/* Header with quick stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#1C0D09] via-[#2A140F] to-[#120705] p-6 sm:p-8 rounded-[3rem] border-2 border-brand-gold/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-orange to-brand-gold text-brand-brown flex items-center justify-center shadow-xl shadow-brand-orange/30 shrink-0">
            <Megaphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-gold/20 text-brand-gold text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                Centre de Contrôle 360°
              </span>
              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Prêt à diffuser
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white mt-1">
              Service Marketing & Croissance
            </h2>
            <p className="text-xs text-white/60 font-bold">
              Gérez vos codes promos, lancez vos campagnes WhatsApp et boostez vos ventes en temps réel.
            </p>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-2xl border border-white/10 shrink-0">
          <div className="px-3 py-1 text-center">
            <span className="text-[8px] font-black uppercase text-brand-gold block">Codes Actifs</span>
            <span className="text-sm font-black text-white">{promoCodes.filter(p => p.isActive).length}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="px-3 py-1 text-center">
            <span className="text-[8px] font-black uppercase text-brand-orange block">Bannière</span>
            <span className="text-xs font-black text-emerald-400">{banner.isEnabled ? 'Active' : 'Éteinte'}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="px-3 py-1 text-center">
            <span className="text-[8px] font-black uppercase text-white/60 block">Audience VIP</span>
            <span className="text-sm font-black text-brand-gold">{customerAudience.length} Clients</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'CAMPAIGNS', label: '1. Campagnes & Diffusion WhatsApp', icon: Send, badge: 'Direct' },
          { id: 'PROMO_CODES', label: '2. Codes Promo & Remises', icon: Tag, badge: `${promoCodes.length}` },
          { id: 'BANNER', label: '3. Bannière Live dans l\'App', icon: Megaphone, badge: banner.isEnabled ? 'ON' : 'OFF' },
          { id: 'FLASH_DEALS', label: '4. Offres Flash du Jour', icon: Flame, badge: 'Booster' },
          { id: 'CLIENTS_CRM', label: '5. Relance Clients VIP', icon: Users, badge: `${customerAudience.length}` },
          { id: 'AI_STRATEGY', label: '6. Stratège & Audit IA', icon: Sparkles, badge: 'Gemini' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              playSound('pop');
              setActiveTab(tab.id as any);
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/30 scale-[1.02]'
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${
              activeTab === tab.id ? 'bg-black/30 text-white' : 'bg-white/10 text-brand-gold'
            }`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1 : COMPOSITEUR & DIFFUSEUR DE CAMPAGNES MULTI-CANAUX */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Column: Template Selector & AI generator */}
          <div className="space-y-4">
            <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                <Layers size={16} /> Modèles de Campagne Prêts
              </h3>
              <p className="text-[10px] text-white/60 font-bold">
                Sélectionnez un modèle adapté à votre objectif de vente du jour :
              </p>

              <div className="space-y-2">
                {MARKETING_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      playSound('pop');
                      setSelectedTemplate(tpl);
                      setCampaignTitle(tpl.title);
                      setCampaignText(tpl.bodyText);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      selectedTemplate.id === tpl.id 
                        ? 'bg-brand-gold/15 border-brand-gold text-white shadow-md' 
                        : 'bg-black/30 border-white/5 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black truncate">{tpl.title}</p>
                      <span className="text-[8px] text-brand-gold uppercase font-mono font-bold">
                        Code suggéré : {tpl.suggestedPromo}
                      </span>
                    </div>
                    {selectedTemplate.id === tpl.id && (
                      <CheckCircle2 size={16} className="text-brand-gold shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generator Box */}
            <div className="bg-gradient-to-br from-purple-950/40 to-brand-brown/50 p-6 rounded-[2.5rem] border border-purple-500/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles size={18} className="animate-spin" />
                <h4 className="text-xs font-black uppercase tracking-wider">Assistant Rédacteur IA</h4>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed font-bold">
                Besoin d'un texte original ? L'IA rédige pour vous un message de vente captivant avec emojis et arguments de choc.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGenerateAiCopy('Vente Flash Tiep Royal Déjeuner')}
                  disabled={isAiGenerating}
                  className="bg-white/10 hover:bg-purple-600 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                >
                  ⚡ Tiep Flash
                </button>
                <button
                  onClick={() => handleGenerateAiCopy('Box Sauces Traditionnelles')}
                  disabled={isAiGenerating}
                  className="bg-white/10 hover:bg-purple-600 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                >
                  🥘 Box Sauces
                </button>
                <button
                  onClick={() => handleGenerateAiCopy('Grillades Suya & Dibi Weekend')}
                  disabled={isAiGenerating}
                  className="bg-white/10 hover:bg-purple-600 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                >
                  🍖 Grillades Soir
                </button>
                <button
                  onClick={() => handleGenerateAiCopy('Pack Buffet Événementiel Entreprise')}
                  disabled={isAiGenerating}
                  className="bg-white/10 hover:bg-purple-600 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                >
                  👑 Buffets Pro
                </button>
              </div>
            </div>
          </div>

          {/* Center & Right Column: Message Editor, Preview & One-Click Broadcast */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-black italic uppercase text-brand-gold tracking-wider">
                    Éditeur de Message Marketing
                  </h3>
                  <p className="text-[9px] text-white/50 font-bold uppercase mt-0.5">
                    Modifiez le texte à votre convenance avant de le diffuser en 1 clic
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCampaign}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    {copiedText ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedText ? 'Copié !' : 'Copier Texte'}</span>
                  </button>

                  <button
                    onClick={() => handleBroadcast()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <Send size={14} /> Diffuser Statut WhatsApp
                  </button>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <label className="font-black uppercase text-white/60">Contenu du Message :</label>
                  <span className="text-white/40 font-mono">{campaignText.length} caractères</span>
                </div>
                <textarea
                  rows={10}
                  value={campaignText}
                  onChange={(e) => setCampaignText(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-2xl p-4 text-xs font-mono text-white leading-relaxed focus:outline-none focus:border-brand-gold resize-y shadow-inner"
                  placeholder="Tapez votre message publicitaire ici..."
                />
              </div>

              {/* Broadcast Options & Phone Dispatch */}
              <div className="bg-black/40 p-5 rounded-3xl border border-white/10 space-y-4">
                <h4 className="text-xs font-black uppercase text-brand-gold flex items-center gap-2">
                  <Send size={16} /> Options d'Envoi Direct
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-white/50">
                      Envoyer à un Numéro ou Groupe spécifique :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+227 70 03 25 52 ou Groupe"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold font-mono"
                      />
                      <button
                        onClick={() => handleBroadcast(targetPhone)}
                        className="bg-brand-orange hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shrink-0"
                      >
                        <Send size={12} /> Envoyer
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-white/50">
                      Réseaux Sociaux & SMS :
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyCampaign}
                        className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Share2 size={12} /> Facebook / Insta
                      </button>
                      <button
                        onClick={() => {
                          playSound('pop');
                          window.location.href = `sms:?body=${encodeURIComponent(campaignText)}`;
                        }}
                        className="flex-1 bg-amber-600/80 hover:bg-amber-600 text-white py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Smartphone size={12} /> SMS Direct
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 : GESTIONNAIRE DE CODES PROMO & REMISES */}
      {activeTab === 'PROMO_CODES' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-black italic uppercase text-brand-gold tracking-wider flex items-center gap-2">
                  <Tag size={20} className="text-brand-orange" /> Codes Promo & Réductions Actifs
                </h3>
                <p className="text-[10px] text-white/60 font-bold mt-1">
                  Créez des codes promotionnels utilisables immédiatement par les clients lors de la commande dans leur panier.
                </p>
              </div>

              <button
                onClick={() => {
                  playSound('pop');
                  setShowAddPromoModal(true);
                }}
                className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-orange/30 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus size={16} /> Nouveau Code Promo
              </button>
            </div>

            {/* Promo Codes Table / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 ${
                    promo.isActive
                      ? 'bg-[#1C0F0D] border-brand-gold/40 shadow-xl'
                      : 'bg-white/5 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-brand-gold/20 text-brand-gold font-mono font-black text-sm border border-brand-gold/30">
                        {promo.code}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        promo.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {promo.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePromo(promo.id)}
                        title={promo.isActive ? 'Désactiver' : 'Activer'}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] transition-all"
                      >
                        {promo.isActive ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} className="text-white/40" />}
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        title="Supprimer"
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <p className="text-white/90 font-bold">{promo.description}</p>
                    <div className="flex justify-between text-white/50 text-[9px] pt-2 border-t border-white/5">
                      <span>Valeur : <strong className="text-brand-orange">{promo.value}{promo.type === 'PERCENT' ? '%' : ' F CFA'}</strong></span>
                      <span>Min. Commande : <strong>{promo.minOrder.toLocaleString('fr-FR')} F</strong></span>
                    </div>
                    <div className="flex justify-between text-white/50 text-[9px]">
                      <span>Utilisations : <strong className="text-brand-gold">{promo.usageCount} fois</strong></span>
                      <span>Expire : <strong>{promo.expiryDate || 'Non défini'}</strong></span>
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => {
                      const shareMsg = `*Offre Exclusive Khady's Food !* 🎁 Profitez de *${promo.description}* avec le code promo *${promo.code}* sur https://wa.me/${RESTAURANT_INFO.whatsappClean}`;
                      broadcastToWhatsApp(shareMsg);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-brand-gold py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Share2 size={12} /> Partager ce Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT NOUVEAU CODE PROMO */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#180E0C] border-2 border-brand-gold/40 rounded-[3rem] p-6 sm:p-8 max-w-md w-full text-white space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-base font-black italic uppercase text-brand-gold flex items-center gap-2">
                <Tag size={20} className="text-brand-orange" /> Nouveau Code Promo
              </h3>
              <button
                onClick={() => setShowAddPromoModal(false)}
                className="text-white/40 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPromo} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/60">
                  Code Promotionnel (Ex: VENDREDI20, FLASH10) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: VENDREDI20"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-3.5 text-sm font-mono font-black text-brand-gold uppercase tracking-widest focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-white/60">Type de Remise</label>
                  <select
                    value={newPromo.type}
                    onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="PERCENT">Pourcentage (%)</option>
                    <option value="FIXED">Montant Fixe (F CFA)</option>
                    <option value="GIFT">Cadeau / Offre Spéciale</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-white/60">Valeur ({newPromo.type === 'PERCENT' ? '%' : 'F CFA'})</label>
                  <input
                    type="number"
                    required
                    value={newPromo.value || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                    placeholder="Ex: 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-white/60">Min. Commande (F CFA)</label>
                  <input
                    type="number"
                    value={newPromo.minOrder || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, minOrder: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                    placeholder="Ex: 5000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-white/60">Date Expiration</label>
                  <input
                    type="date"
                    value={newPromo.expiryDate || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-white/60">Description de l'Offre</label>
                <input
                  type="text"
                  placeholder="Ex: 20% de remise sur tous les Tieps"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPromoModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-orange-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Enregistrer le Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3 : GESTIONNAIRE DE BANNIÈRE D'ANNONCE EN DIRECT DANS L'APP */}
      {activeTab === 'BANNER' && (
        <div className="space-y-6 animate-fade-in">
          <form onSubmit={handleSaveBanner} className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base font-black italic uppercase text-brand-gold tracking-wider flex items-center gap-2">
                  <Megaphone size={20} className="text-brand-orange" /> Bannière Live dans l'Application Cliente
                </h3>
                <p className="text-[10px] text-white/60 font-bold mt-1">
                  Ce bandeau défilant s'affiche tout en haut de l'application cliente pour capter immédiatement l'attention de tous les visiteurs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/70">
                  Afficher la Bannière :
                </span>
                <button
                  type="button"
                  onClick={() => setBanner({ ...banner, isEnabled: !banner.isEnabled })}
                  className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${
                    banner.isEnabled ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-brand-gold block">
                Aperçu en Temps Réel dans l'App :
              </label>
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                banner.isEnabled 
                  ? 'bg-gradient-to-r from-brand-orange via-amber-600 to-brand-gold border-white/30 text-white shadow-xl' 
                  : 'bg-white/5 border-white/10 text-white/30'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 text-white font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                    {banner.badge || 'PROMO 🔥'}
                  </span>
                  <span className="text-xs font-black">
                    {banner.text} <span className="underline decoration-2 font-mono font-black">{banner.highlight}</span>
                  </span>
                </div>
                <span className="bg-white text-brand-brown font-black text-[9px] uppercase px-3 py-1 rounded-xl shadow-sm shrink-0">
                  En profiter →
                </span>
              </div>
            </div>

            {/* Banner Config Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Badge Annonce (Ex: VENTE FLASH 🔥)</label>
                <input
                  type="text"
                  value={banner.badge}
                  onChange={(e) => setBanner({ ...banner, badge: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: VENTE FLASH 🔥"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Code Promo / Mot en gras</label>
                <input
                  type="text"
                  value={banner.highlight}
                  onChange={(e) => setBanner({ ...banner, highlight: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="Ex: KHADY24"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Texte principal du bandeau</label>
                <input
                  type="text"
                  value={banner.text}
                  onChange={(e) => setBanner({ ...banner, text: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Offre Spéciale : -15% sur tout le menu avec le code"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {bannerSaved ? (
                <span className="text-emerald-400 text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Bannière mise à jour dans l'application !
                </span>
              ) : <span></span>}

              <button
                type="submit"
                className="bg-brand-gold hover:bg-yellow-400 text-brand-brown px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 size={16} /> Enregistrer la Bannière
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4 : BOOSTER D'OFFRE FLASH DU JOUR */}
      {activeTab === 'FLASH_DEALS' && (
        <div className="space-y-6 animate-fade-in">
          <form onSubmit={handleSaveFlashDeal} className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base font-black italic uppercase text-brand-gold tracking-wider flex items-center gap-2">
                  <Flame size={20} className="text-brand-orange" /> Booster d'Offre Flash Quotidienne
                </h3>
                <p className="text-[10px] text-white/60 font-bold mt-1">
                  Créez un sentiment d'urgence avec un plat en réduction immédiate, un stock limité et un compte à rebours.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/70">
                  Activer l'Offre Flash :
                </span>
                <button
                  type="button"
                  onClick={() => setFlashDeal({ ...flashDeal, isEnabled: !flashDeal.isEnabled })}
                  className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${
                    flashDeal.isEnabled ? 'bg-brand-orange justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Nom du Plat en Vedette</label>
                <input
                  type="text"
                  value={flashDeal.dishName}
                  onChange={(e) => setFlashDeal({ ...flashDeal, dishName: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Tiep Royal Khady"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Image du Plat (Lien Unsplash ou URL)</label>
                <input
                  type="text"
                  value={flashDeal.dishImage}
                  onChange={(e) => setFlashDeal({ ...flashDeal, dishImage: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Prix Normal (F CFA)</label>
                <input
                  type="number"
                  value={flashDeal.dishPrice}
                  onChange={(e) => {
                    const original = Number(e.target.value);
                    const promo = flashDeal.promoPrice;
                    const pct = original > 0 ? Math.round(((original - promo) / original) * 100) : 0;
                    setFlashDeal({ ...flashDeal, dishPrice: original, discountPercent: pct });
                  }}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Prix Réduit Flash (F CFA)</label>
                <input
                  type="number"
                  value={flashDeal.promoPrice}
                  onChange={(e) => {
                    const promo = Number(e.target.value);
                    const original = flashDeal.dishPrice;
                    const pct = original > 0 ? Math.round(((original - promo) / original) * 100) : 0;
                    setFlashDeal({ ...flashDeal, promoPrice: promo, discountPercent: pct });
                  }}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-brand-gold text-brand-orange font-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Stock Restant Affiché</label>
                <input
                  type="number"
                  value={flashDeal.remainingStock}
                  onChange={(e) => setFlashDeal({ ...flashDeal, remainingStock: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-white/60">Durée du Compte à Rebours (Heures)</label>
                <input
                  type="number"
                  value={flashDeal.durationHours}
                  onChange={(e) => setFlashDeal({ ...flashDeal, durationHours: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {flashSaved ? (
                <span className="text-emerald-400 text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Offre Flash mise à jour !
                </span>
              ) : <span></span>}

              <button
                type="submit"
                className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <Flame size={16} /> Mettre en Ligne l'Offre Flash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5 : CRM AUDIENCE CLIENTS & RELANCES PERSONNALISÉES */}
      {activeTab === 'CLIENTS_CRM' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black italic uppercase text-brand-gold tracking-wider flex items-center gap-2">
                  <Users size={20} className="text-brand-orange" /> Base Clients VIP & Relances
                </h3>
                <p className="text-[10px] text-white/60 font-bold mt-1">
                  Relancez directement vos meilleurs clients sur WhatsApp avec des offres personnalisées.
                </p>
              </div>

              <span className="bg-brand-gold/20 text-brand-gold px-3.5 py-1 rounded-full text-[9px] font-black uppercase border border-brand-gold/30 self-start sm:self-auto">
                {customerAudience.length} Clients Enregistrés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-black uppercase text-white/40 tracking-wider">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Téléphone</th>
                    <th className="pb-3">Quartier</th>
                    <th className="pb-3">Commandes</th>
                    <th className="pb-3">Total Dépensé</th>
                    <th className="pb-3 text-right">Action Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customerAudience.map((client, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-black text-white">{client.name}</td>
                      <td className="py-4 font-mono text-brand-gold font-bold">{client.phone}</td>
                      <td className="py-4 text-white/70">{client.district}</td>
                      <td className="py-4 font-black">
                        <span className="bg-white/10 px-2 py-0.5 rounded-md font-mono">{client.ordersCount}</span>
                      </td>
                      <td className="py-4 font-black text-brand-orange font-mono">
                        {client.totalSpent.toLocaleString('fr-FR')} F CFA
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            const vipMsg = `*Bonjour ${client.name} !* 🍲✨\n\n` +
                              `Toute l'équipe de *Khady's Food* vous remercie chaleureusement pour votre fidélité.\n` +
                              `Pour votre prochaine commande, nous avons le plaisir de vous offrir *1 000 F CFA de remise immédiate* avec votre code VIP : *BIENVENUE* !\n\n` +
                              `Découvrez la carte du jour ici : https://wa.me/${RESTAURANT_INFO.whatsappClean}\n` +
                              `_Au plaisir de vous régaler à nouveau !_`;
                            broadcastToWhatsApp(vipMsg, client.phone);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 active:scale-95 transition-all shadow-md"
                        >
                          <MessageSquare size={12} /> Relance VIP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6 : STRATÈGE & AUDIT MARKETING IA (GEMINI) */}
      {activeTab === 'AI_STRATEGY' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base font-black italic uppercase text-brand-gold tracking-wider flex items-center gap-2">
                  <Sparkles size={20} className="text-brand-orange animate-spin" /> Stratège Marketing IA (Gemini)
                </h3>
                <p className="text-[10px] text-white/60 font-bold mt-1">
                  Obtenez des recommandations tactiques adaptées au marché de Niamey pour maximiser votre chiffre d'affaires.
                </p>
              </div>

              <button
                onClick={handleRunAiAudit}
                disabled={aiLoading}
                className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-orange/30 active:scale-95 transition-all self-start sm:self-auto"
              >
                {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Générer le Plan de Croissance</span>
              </button>
            </div>

            {aiStrategyResult ? (
              <div className="bg-black/60 p-6 sm:p-8 rounded-3xl border border-brand-gold/30 text-white/90 text-xs leading-relaxed whitespace-pre-line font-mono animate-fade-in space-y-4">
                {aiStrategyResult}
              </div>
            ) : (
              <div className="py-16 text-center text-white/30 italic text-xs space-y-2">
                <Sparkles size={32} className="mx-auto opacity-30 text-brand-gold" />
                <p>Cliquez sur « Générer le Plan de Croissance » pour auditer les ventes et obtenir des idées marketing.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMarketingCenter;
