import { Order, MenuItem } from '../types';
import { RESTAURANT_INFO, BILLO_INFO } from '../constants';
import { openWhatsApp, cleanPhoneNumber } from './whatsapp';

export interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED' | 'GIFT';
  value: number; // e.g. 20 (pour 20%) ou 1000 (pour 1000 F CFA)
  minOrder: number;
  isActive: boolean;
  usageCount: number;
  description: string;
  targetCategory?: string;
  expiryDate?: string;
}

export interface AnnouncementBanner {
  isEnabled: boolean;
  text: string;
  highlight: string;
  badge: string;
  promoCode?: string;
  bgGradient: 'orange' | 'gold' | 'emerald' | 'purple' | 'red';
  linkTarget: 'MENU' | 'CART' | 'TRAITEUR' | 'HOME';
}

export interface MarketingCampaign {
  id: string;
  title: string;
  category: 'FLASH' | 'MENU_DU_JOUR' | 'WEEKEND' | 'BUFFET' | 'FIDELITE' | 'CUSTOM';
  headline: string;
  bodyText: string;
  promoCode?: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
}

export interface FlashDealConfig {
  isEnabled: boolean;
  dishName: string;
  dishPrice: number;
  promoPrice: number;
  discountPercent: number;
  remainingStock: number;
  totalStock: number;
  dishImage: string;
  durationHours: number;
  expiresAt: string;
}

// Default initial promo codes
export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'KHADY24',
    type: 'PERCENT',
    value: 15,
    minOrder: 4000,
    isActive: true,
    usageCount: 48,
    description: '15% de remise sur toute la carte Khady\'s Food',
    expiryDate: '2026-12-31'
  },
  {
    id: 'promo-2',
    code: 'FLASH20',
    type: 'PERCENT',
    value: 20,
    minOrder: 5000,
    isActive: true,
    usageCount: 29,
    description: '20% de réduction immédiate sur Spécialités & Tieps',
    expiryDate: '2026-09-30'
  },
  {
    id: 'promo-3',
    code: 'BIENVENUE',
    type: 'FIXED',
    value: 1000,
    minOrder: 6000,
    isActive: true,
    usageCount: 15,
    description: '1 000 F CFA de réduction offerte sur votre première commande',
    expiryDate: '2026-12-31'
  },
  {
    id: 'promo-4',
    code: 'BUFFETPRO',
    type: 'PERCENT',
    value: 15,
    minOrder: 25000,
    isActive: true,
    usageCount: 8,
    description: '15% de remise sur les Packs Buffets d\'Entreprise',
    expiryDate: '2026-12-31'
  },
  {
    id: 'promo-5',
    code: 'BISSAPFREE',
    type: 'GIFT',
    value: 1000,
    minOrder: 4500,
    isActive: true,
    usageCount: 34,
    description: '1 Grande Boisson Bissap Glacée 100% naturelle offerte',
    expiryDate: '2026-10-31'
  }
];

// Default announcement banner
export const INITIAL_BANNER: AnnouncementBanner = {
  isEnabled: true,
  text: 'Offre Spéciale du Moment : -15% sur toutes vos commandes avec le code',
  highlight: 'KHADY24',
  badge: 'VENTE FLASH 🔥',
  promoCode: 'KHADY24',
  bgGradient: 'orange',
  linkTarget: 'MENU'
};

// Default Flash Deal Config
export const INITIAL_FLASH_DEAL: FlashDealConfig = {
  isEnabled: true,
  dishName: 'Pack Duo Grillades Suya + 2 Jus Bissap',
  dishPrice: 8500,
  promoPrice: 5500,
  discountPercent: 35,
  remainingStock: 4,
  totalStock: 20,
  dishImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000',
  durationHours: 4,
  expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
};

// Storage Helpers
export const getStoredPromoCodes = (): PromoCode[] => {
  try {
    const data = localStorage.getItem('khadys_promo_codes');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_PROMO_CODES;
};

export const saveStoredPromoCodes = (codes: PromoCode[]): void => {
  try {
    localStorage.setItem('khadys_promo_codes', JSON.stringify(codes));
  } catch (e) {}
};

export const getStoredBanner = (): AnnouncementBanner => {
  try {
    const data = localStorage.getItem('khadys_announcement_banner');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return INITIAL_BANNER;
};

export const saveStoredBanner = (banner: AnnouncementBanner): void => {
  try {
    localStorage.setItem('khadys_announcement_banner', JSON.stringify(banner));
  } catch (e) {}
};

export const getStoredFlashDeal = (): FlashDealConfig => {
  try {
    const data = localStorage.getItem('khadys_flash_deal');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return INITIAL_FLASH_DEAL;
};

export const saveStoredFlashDeal = (deal: FlashDealConfig): void => {
  try {
    localStorage.setItem('khadys_flash_deal', JSON.stringify(deal));
  } catch (e) {}
};

// Check and validate a promo code against current cart
export interface PromoValidationResult {
  isValid: boolean;
  discountAmount: number;
  promoCodeObj?: PromoCode;
  errorMessage?: string;
  successMessage?: string;
}

export const applyPromoCode = (inputCode: string, subtotal: number): PromoValidationResult => {
  if (!inputCode || !inputCode.trim()) {
    return { isValid: false, discountAmount: 0, errorMessage: 'Veuillez saisir un code promo.' };
  }

  const cleanInput = inputCode.trim().toUpperCase();
  const allCodes = getStoredPromoCodes();
  const found = allCodes.find(c => c.code.toUpperCase() === cleanInput);

  if (!found) {
    return { isValid: false, discountAmount: 0, errorMessage: `Le code « ${cleanInput} » n'existe pas ou est expiré.` };
  }

  if (!found.isActive) {
    return { isValid: false, discountAmount: 0, errorMessage: `Le code « ${found.code} » a été désactivé.` };
  }

  if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
    return { isValid: false, discountAmount: 0, errorMessage: `Le code « ${found.code} » est arrivé à expiration.` };
  }

  if (subtotal < found.minOrder) {
    return { 
      isValid: false, 
      discountAmount: 0, 
      errorMessage: `Montant insuffisant. Le code « ${found.code} » requiert un minimum de ${found.minOrder.toLocaleString('fr-FR')} F CFA.` 
    };
  }

  let discount = 0;
  let successMsg = '';

  if (found.type === 'PERCENT') {
    discount = Math.round((subtotal * found.value) / 100);
    successMsg = `🎉 Code « ${found.code} » appliqué : -${found.value}% (-${discount.toLocaleString('fr-FR')} F CFA)`;
  } else if (found.type === 'FIXED') {
    discount = Math.min(found.value, subtotal);
    successMsg = `🎉 Code « ${found.code} » appliqué : -${discount.toLocaleString('fr-FR')} F CFA offerts !`;
  } else if (found.type === 'GIFT') {
    discount = Math.min(found.value, subtotal);
    successMsg = `🎁 Cadeau offert avec « ${found.code} » : ${found.description}`;
  }

  return {
    isValid: true,
    discountAmount: discount,
    promoCodeObj: found,
    successMessage: successMsg
  };
};

// Campaign Templates for Fast Marketing Broadcast
export const MARKETING_TEMPLATES = [
  {
    id: 'tpl-tiep-midi',
    title: '🍲 Vente Flash Tiep Royal (Midi)',
    category: 'FLASH' as const,
    headline: '⚡ Vente Flash Déjeuner — Tiep Royal Khady\'s Food !',
    bodyText: `*BON APPÉTIT NIAMEY ! LE TIEP ROYAL DU MIDI EST PRÊT !* 🥘🔥\n\n` +
      `Envie d'un déjeuner gourmand et authentique au bureau ou à la maison ?\n` +
      `Nos marmites bouillonnent chez *Khady's Food* avec nos morceaux de poisson et viande braisée fondante.\n\n` +
      `🎁 *Offre Spéciale Déjeuner :* -15% sur toutes les commandes passées avant 14h avec le code *KHADY24* !\n` +
      `🛵 Livraison express assurée partout à Niamey par *Billo Express*.\n\n` +
      `👉 Cliquez ici pour commander votre part : https://wa.me/${RESTAURANT_INFO.whatsappClean}\n` +
      `_Khady's Food & Event — L'art culinaire au Sahel_`,
    suggestedPromo: 'KHADY24'
  },
  {
    id: 'tpl-sauce-box',
    title: '🥫 Promotion Box Sauces Africaines',
    category: 'MENU_DU_JOUR' as const,
    headline: '🔥 Promo Spéciale Box Sauces — Mafé, Gombo & Feuilles',
    bodyText: `*DÉCOUVREZ NOS BOX SAUCES TRADITIONNELLES KHADY'S FOOD !* 🥘✨\n\n` +
      `Faites le plein de saveurs avec nos Box Sauces préparées dans la pure tradition africaine :\n` +
      `• *Box Sauce Mafé Onctueuse* aux cacahuètes grillées\n` +
      `• *Box Sauce Gombo Frais & Viande Tendre*\n` +
      `• *Box Sauce Feuille & Poisson Fumé*\n\n` +
      `🎁 *Pack Découverte :* 3 Box commandées = 1 Grande Bouteille de Jus Bissap offerte !\n` +
      `📞 Commandes rapides : ${RESTAURANT_INFO.whatsapp}\n` +
      `_Livraison chaude et soignée à domicile ou au bureau._`,
    suggestedPromo: 'BISSAPFREE'
  },
  {
    id: 'tpl-weekend-dibi',
    title: '🥩 Festin Week-end Grillades & Dibi',
    category: 'WEEKEND' as const,
    headline: '🍖 Soirée Dibi d’Agneau & Grillades au Feu de Bois',
    bodyText: `*WEEK-END GOURMAND CHEZ KHADY'S FOOD !* 🥩🔥\n\n` +
      `Ce week-end, offrez-vous le meilleur Dibi d'Agneau de Niamey, assaisonné aux épices secrètes du Chef et grillé lentement au feu de bois avec ses bananes plantains (Aloko) et oignons caramélisés.\n\n` +
      `⚡ *Code Promo VIP Week-end :* Utilisez *FLASH20* pour 20% de remise immédiate !\n` +
      `🛵 Commandez pour votre famille ou vos amis, livraison express par Billo !\n\n` +
      `📲 Commandes WhatsApp directes : https://wa.me/${RESTAURANT_INFO.whatsappClean}`,
    suggestedPromo: 'FLASH20'
  },
  {
    id: 'tpl-buffet-event',
    title: '👑 Buffets & Événements Entreprise',
    category: 'BUFFET' as const,
    headline: '✨ Buffets Haut de Gamme pour Séminaires & Cérémonies',
    bodyText: `*VOUS ORGANISEZ UN ÉVÉNEMENT, RÉUNION OU MARIAGE À NIAMEY ?* 👑🎉\n\n` +
      `Confiez votre service traiteur à *Khady's Food & Event* :\n` +
      `✅ Menus gastronomiques africains et européens sur-mesure\n` +
      `✅ Présentation soignée, nappage et vaisselle de standing\n` +
      `✅ Équipe de service dynamique et professionnelle\n\n` +
      `💼 *Offre Entreprise :* Devis personnalisé en moins de 2 heures + 15% de remise avec le code *BUFFETPRO*.\n\n` +
      `📞 Contact Direct Traiteur : ${RESTAURANT_INFO.directLine} / WhatsApp : ${RESTAURANT_INFO.whatsapp}`,
    suggestedPromo: 'BUFFETPRO'
  },
  {
    id: 'tpl-fidelite-vip',
    title: '💎 Relance & Récompense Clients VIP',
    category: 'FIDELITE' as const,
    headline: '🎁 1 000 F CFA offerts pour vous remercier de votre fidélité',
    bodyText: `*MERCI POUR VOTRE FIDÉLITÉ CHEZ KHADY'S FOOD !* 💖🍲\n\n` +
      `Nous avons le plaisir de vous offrir un bon d'achat exclusif de *1 000 F CFA* à valoir dès aujourd'hui sur votre prochain festin avec le code personnel : *BIENVENUE*.\n\n` +
      `🛵 Nos livreurs Billo Express sont prêts à vous livrer en un éclair !\n` +
      `👉 Cliquez ici pour commander : https://wa.me/${RESTAURANT_INFO.whatsappClean}\n` +
      `_Excellente dégustation de la part de toute l'équipe de Cheffe Khady !_`,
    suggestedPromo: 'BIENVENUE'
  }
];

// Broadcast action to WhatsApp Status or Contacts
export const broadcastToWhatsApp = (message: string, targetPhone?: string): void => {
  if (targetPhone && targetPhone.trim()) {
    const clean = cleanPhoneNumber(targetPhone);
    const url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  } else {
    // Open generic WhatsApp share to status/chats
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
};
