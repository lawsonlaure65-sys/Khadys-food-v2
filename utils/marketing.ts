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

export type PosterTheme = 'LUXURY_GOLD' | 'SAHEL_TERRACOTTA' | 'WOOD_FIRE' | 'MODERN_EMERALD';
export type PosterFormat = 'SQUARE_POST' | 'STORY_PORTRAIT' | 'BANNER_LANDSCAPE';
export type PublicationTiming = 'TONIGHT_FOR_TOMORROW' | 'TODAY_LUNCH';

export interface PlatDuJourConfig {
  id: string;
  date: string;
  targetDayLabel?: string; // e.g., "Demain Midi", "Ce Midi", "Vendredi 14 Août"
  publicationTiming: PublicationTiming; // Posté la veille au soir vs ce matin
  dishName: string;
  tagline: string;
  description: string;
  accompaniments: string;
  price: number;
  promoPrice?: number;
  dishImage: string;
  chefQuote: string;
  remainingStock: number;
  promoCode?: string;
  deliveryTime: string;
  isActive: boolean;
  posterTheme: PosterTheme;
  posterFormat: PosterFormat;
  marketingTextWhatsApp: string;
  marketingTextGroups: string;
  marketingTextSocial: string;
  marketingTextEveningTeaser: string;
  hashtags: string;
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

// Default Initial Plat du Jour
export const INITIAL_PLAT_DU_JOUR: PlatDuJourConfig = {
  id: 'pdj-today',
  date: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
  targetDayLabel: 'Demain Midi',
  publicationTiming: 'TONIGHT_FOR_TOMORROW',
  posterTheme: 'LUXURY_GOLD',
  posterFormat: 'SQUARE_POST',
  dishName: 'Tiep Royal Rouge au Mérou Frais & Légumes Fondants',
  tagline: 'Le joyau culinaire sénégalais de Cheffe Khady',
  description: 'Riz rouge sénégalais long grain parfumé au bouillon riche de mérou braisé, carottes glacées, manioc fondant, chou braisé et sauce tamarin-piment maison.',
  accompaniments: 'Bananes Alloco dorées + 1 Grande Bouteille de Jus Bissap Glacé 50cl offerte',
  price: 5500,
  promoPrice: 4500,
  dishImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000',
  chefQuote: '« Cuisiné lentement au feu de bois avec des épices sélectionnées ce matin au marché de Niamey. » — Cheffe Khady',
  remainingStock: 25,
  promoCode: 'KHADY24',
  deliveryTime: '11h30 - 14h30',
  isActive: true,
  marketingTextWhatsApp: `*🍲 PLAT DU JOUR CHEZ KHADY'S FOOD ! 🍲*\n\n` +
    `Aujourd'hui, Cheffe Khady vous a concocté notre légendaire :\n` +
    `✨ *TIEP ROYAL ROUGE AU MÉROU FRAIS & LÉGUMES FONDANTS* ✨\n\n` +
    `🔥 *Au menu :* Riz rouge parfumé aux épices douces, pavé de mérou braisé au feu de bois, manioc, carotte fondante & alloco doré croustillant.\n` +
    `🎁 *Bonus du midi :* 1 Grande Bouteille de Jus Bissap glacé 50cl offerte avec chaque plat !\n\n` +
    `💰 *Tarif Spécial Déjeuner :* 4 500 F CFA (au lieu de 5 500 F)\n` +
    `🛵 *Livraison Express Niamey :* Livré brûlant en moins de 35 min par Billo Express !\n\n` +
    `👉 *Commandez maintenant avant épuisement du stock (25 parts dispo) :*\n` +
    `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonjour%20je%20souhaite%20commander%20le%20Plat%20du%20Jour%20Tiep%20Royal\n\n` +
    `_Khady's Food & Event — L'excellence culinaire au Sahel_`,
  marketingTextGroups: `*🍲 ALERTE GOURMANDE DU MIDI — KHADY'S FOOD 🍲*\n\n` +
    `Chers membres, les marmites bouillonnent pour le déjeuner ! 🥘🔥\n` +
    `Aujourd'hui au menu du jour :\n` +
    `👑 *Tiep Royal Rouge au Mérou Frais & Légumes Fondants*\n` +
    `🍌 Accompagné d'Alloco croustillant et 1 Jus Bissap glacé offert !\n\n` +
    `⚡ Tarif spécial groupe / bureau : *4 500 F CFA* (Remise spéciale)\n` +
    `📦 Commandes groupées d'entreprise acceptées avec facture normalisée.\n\n` +
    `📲 Commande rapide WhatsApp : https://wa.me/${RESTAURANT_INFO.whatsappClean}`,
  marketingTextSocial: `✨ 𝐏𝐋𝐀𝐓 𝐃𝐔 𝐉𝐎𝐔𝐑 | 𝐊𝐇𝐀𝐃𝐘'𝐒 𝐅𝐎𝐎𝐃 & 𝐄𝐕𝐄𝐍𝐓 ✨\n\n` +
    `Laissez-vous tenter par notre *Tiep Royal Rouge au Mérou Frais*, une véritable explosion de saveurs authentiques cuisinée dans la pure tradition sahélienne par Cheffe Khady ! 🥘🇸🇳🇳🇪\n\n` +
    `🌾 Riz rouge cuit à cœur dans son bouillon épicé\n` +
    `🐟 Mérou sauvage braisé fondant\n` +
    `🥕 Légumes du marché cuits à la vapeur\n` +
    `🍌 Alloco doré et son jus Bissap maison offert\n\n` +
    `📍 Disponible en livraison partout à Niamey ou à emporter.\n` +
    `⚡ Tarif du jour : 4 500 F CFA\n` +
    `📲 Commandez par WhatsApp au ${RESTAURANT_INFO.whatsapp}\n\n` +
    `#KhadyFood #PlatDuJour #TiepRoyal #Niamey #GastronomieAfricaine #BilloExpress #DejeunerNiamey #FoodNiger`,
  marketingTextEveningTeaser: `🌙 *AU MENU DEMAIN MIDI CHEZ KHADY'S FOOD !* 🍲✨\n\n` +
    `Chers gourmets, pour votre pause déjeuner de demain midi, Cheffe Khady prépare son chef-d'œuvre :\n` +
    `👑 *TIEP ROYAL ROUGE AU MÉROU FRAIS & LÉGUMES FONDANTS*\n\n` +
    `🔥 Un festin généreux avec riz parfumé, mérou sauvage braisé, carottes glacées, manioc fondant...\n` +
    `🎁 *Offre spéciale précommande de nuit :* Alloco doré croustillant + 1 Bouteille de Jus Bissap 50cl Glacée offerte !\n` +
    `💰 *Prix Spécial Déjeuner :* 4 500 F CFA (au lieu de 5 500 F)\n\n` +
    `🛵 *Livraison garantie dès 12h00 précises à votre bureau ou à domicile par Billo Express.*\n` +
    `⚠️ *Important :* Réservez dès ce soir avant 23h pour garantir votre portion (stock limité à 25 parts) !\n\n` +
    `👉 *Pour réserver dès ce soir en 1 clic :*\n` +
    `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonsoir%20je%20réserve%20ma%20part%20pour%20demain%20midi%20du%20Plat%20du%20Jour%20Tiep%20Royal\n\n` +
    `_Bonne soirée à tous et à demain pour un déjeuner royal !_ 🌟`,
  hashtags: '#KhadyFood #PlatDuJour #TiepRoyal #Niamey #CuisineAfricaine #BilloExpress #FoodNiamey'
};

// Preset catalog for fast 1-click Plat du Jour daily configuration
export const PLAT_DU_JOUR_PRESETS = [
  {
    id: 'preset-tiep-merou',
    name: 'Tiep Royal Rouge au Mérou Frais',
    category: 'Spécialité Maison',
    tagline: 'Le grand classique sénégalais aux saveurs iodées',
    description: 'Riz rouge sénégalais parfumé, tranche de mérou braisé, carottes glacées, manioc fondant, chou braisé et sauce pimentée maison.',
    accompaniments: 'Alloco doré croustillant + 1 Bouteille de Jus Bissap Frais 50cl',
    price: 5500,
    promoPrice: 4500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000',
    chefQuote: '« Cuisiné lentement au feu de bois avec des épices fraîches sélectionnées ce matin. » — Cheffe Khady',
    badge: '👑 BEST-SELLER'
  },
  {
    id: 'preset-dibi-agneau',
    name: 'Dibi d’Agneau Braisé au Feu de Bois',
    category: 'Spécialité Maison',
    tagline: 'Viande d\'agneau tendre marinée aux épices kankan & moutarde',
    description: 'Morceaux choisis d\'agneau grillés à la flamme vive, enrobés d\'épices sahéliennes fumées, accompagnés d\'oignons caramélisés et piments doux.',
    accompaniments: 'Bananes Alloco + Frites d\'igname dorées + Jus Baobab Bouye glacé',
    price: 6000,
    promoPrice: 5000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000',
    chefQuote: '« Une viande persillée et croustillante qui fond littéralement sous le palais. » — Cheffe Khady',
    badge: '🥩 FESTIN CARNIVORE'
  },
  {
    id: 'preset-mafe-boeuf',
    name: 'Mafé Onctueux au Bœuf Tendre & Pâte d\'Arachide',
    category: 'Plat Africain',
    tagline: 'Sauce arachide veloutée mijotée à l\'ancienne',
    description: 'Morceaux de bœuf braisé fondant dans une sauce onctueuse à la pâte d\'arachide grillée artisanale, patates douces et carottes confites.',
    accompaniments: 'Riz blanc parfumé jasmin + Alloco + Jus de Tamarin glacé',
    price: 4500,
    promoPrice: 4000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000',
    chefQuote: '« La sauce arachide réconfortante de nos grands-mères dans toute sa noblesse. » — Cheffe Khady',
    badge: '🥜 DOUCEUR & TRADITION'
  },
  {
    id: 'preset-yassa-poulet',
    name: 'Poulet Braisé Yassa au Citron Vert & Oignons Doux',
    category: 'Plat Africain',
    tagline: 'Marinade citronnée aux oignons compotés et moutarde de Dijon',
    description: 'Cuisse de poulet fermier rôtie puis confite dans une marmite d\'oignons caramélisés, jus de citron vert pressé et olives vertes.',
    accompaniments: 'Riz blanc parfumé + Tranches d\'avocat frais + Jus Bissap Menthe',
    price: 4500,
    promoPrice: 3800,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=1000',
    chefQuote: '« L’acidité parfumée du citron et la douceur des oignons fondants. » — Cheffe Khady',
    badge: '🍋 FRAÎCHEUR & SAVEUR'
  },
  {
    id: 'preset-box-gombo',
    name: 'Box Sauce Gombo Frais & Viande Fumée',
    category: 'Box Sauce',
    tagline: 'Sauce gluante traditionnelle aux arômes intenses de poisson fumé',
    description: 'Gombo frais battu au mortier, crevettes séchées, morceaux de viande tendre et poisson fumé du fleuve Niger avec bouillon relevé.',
    accompaniments: 'Pâte de maïs blanc ou Riz brisé + Piment vert écrasé',
    price: 4000,
    promoPrice: 3500,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000',
    chefQuote: '« Un plat authentique et tonique préparé selon les recettes ancestrales. » — Cheffe Khady',
    badge: '🌿 PUR SAHEL'
  },
  {
    id: 'preset-riz-sauce-feuille',
    name: 'Riz Sauce Feuilles & Poisson Fumé du Fleuve',
    category: 'Plat Africain',
    tagline: 'Feuilles d\'oseille et moringa braisées au poisson du Niger',
    description: 'Mélange de feuilles fraîches finement ciselées, mijotées dans un bouillon onctueux au soumbala et poisson fumé de première qualité.',
    accompaniments: 'Riz blanc bio du Niger + Alloco bien doré',
    price: 4000,
    promoPrice: 3500,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000',
    chefQuote: '« Richesse en vitamines et explosion gustative garantie. » — Cheffe Khady',
    badge: '🍃 SAIN & GOURMAND'
  }
];

// Helper to generate dynamic, mouthwatering marketing texts for different channels
export type PlatDuJourStyle = 'GOURMAND' | 'FLASH_MIDI' | 'PRESTIGE_ROYAL';

export const generatePlatDuJourMarketingTexts = (
  plat: Partial<PlatDuJourConfig>,
  style: PlatDuJourStyle = 'GOURMAND'
): { whatsapp: string; groups: string; social: string; eveningTeaser: string; hashtags: string } => {
  const name = plat.dishName || 'Tiep Royal Khady\'s Food';
  const price = plat.promoPrice ? `${plat.promoPrice.toLocaleString('fr-FR')} F CFA` : `${(plat.price || 4500).toLocaleString('fr-FR')} F CFA`;
  const originalPrice = plat.price ? `${plat.price.toLocaleString('fr-FR')} F CFA` : '5 500 F CFA';
  const desc = plat.description || 'Préparé avec soin par Cheffe Khady avec des ingrédients frais du jour.';
  const acc = plat.accompaniments || 'Alloco doré + Jus Bissap Frais offert';
  const dateStr = plat.date || 'Aujourd\'hui';
  const targetDay = plat.targetDayLabel || 'Demain Midi';
  const quote = plat.chefQuote || '« Le meilleur de la cuisine africaine à votre table. »';
  const stock = plat.remainingStock || 25;

  let whatsapp = '';
  let groups = '';
  let social = '';
  let eveningTeaser = '';

  if (style === 'FLASH_MIDI') {
    whatsapp = `*⚡ ALERTE DÉJEUNER MIDI — KHADY'S FOOD ⚡*\n\n` +
      `Ne perdez pas de temps pour votre pause déjeuner ! Notre *Plat du Jour* vient de sortir des fourneaux :\n\n` +
      `🥘 *${name.toUpperCase()}*\n` +
      `😋 ${desc}\n` +
      `🎁 *Bonus inclus :* ${acc}\n\n` +
      `🔥 *Tarif Déjeuner Express :* *${price}* (au lieu de ${originalPrice})\n` +
      `🛵 *Livraison ultra-rapide par Billo Express partout à Niamey en 30 min.*\n` +
      `⏳ *Stock limité :* Plus que *${stock} portions* disponibles !\n\n` +
      `📲 *Cliquez ici pour commander directement :*\n` +
      `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonjour%20je%20veux%20commander%20le%20Plat%20du%20Jour%20${encodeURIComponent(name)}\n\n` +
      `_Khady's Food & Event — Votre déjeuner chaud au bureau ou à domicile !_`;

    groups = `*🥘 MIDI EXPRESS NIAMEY — KHADY'S FOOD 🥘*\n\n` +
      `Bonjour à tous ! Qui n'a pas encore prévu son déjeuner au bureau ?\n` +
      `Aujourd'hui, Cheffe Khady vous régale avec :\n` +
      `👉 *${name}*\n` +
      `✨ ${acc}\n\n` +
      `💰 Tarif spécial : *${price}* seulement !\n` +
      `🛵 Livraison groupée possible pour vos collègues.\n` +
      `📞 Commandes rapides : https://wa.me/${RESTAURANT_INFO.whatsappClean}`;

    social = `🔥 𝐕𝐄𝐍𝐓𝐄 𝐅𝐋𝐀𝐒𝐇 𝐃É𝐉𝐄𝐔𝐍𝐄𝐑 | ${name.toUpperCase()} 🔥\n\n` +
      `Pause déjeuner en vue à Niamey ? Ne cherchez plus quoi manger !\n\n` +
      `Cheffe Khady vous a préparé son fabuleux *${name}* servi bien chaud avec ${acc}.\n\n` +
      `💰 Prix du Jour : *${price}* au lieu de ${originalPrice}\n` +
      `🛵 Livraison Express assurée par Billo Express\n` +
      `📞 Réservez votre part par WhatsApp : ${RESTAURANT_INFO.whatsapp}\n\n` +
      `#NiameyFood #KhadyFood #PlatDuJour #PauseDejeuner #BilloExpress #CuisineAfricaine`;

    eveningTeaser = `🌙 *RÉSERVATION VEILLE AU SOIR — ${targetDay.toUpperCase()}* ⚡\n\n` +
      `Anticipez votre pause déjeuner de demain ! Cheffe Khady prépare son :\n` +
      `👉 *${name.toUpperCase()}*\n` +
      `🎁 *Bonus précommande :* ${acc}\n` +
      `💰 *Tarif Flash :* ${price} (au lieu de ${originalPrice})\n\n` +
      `🛵 Livraison express garantie dès 12h00 précises à Niamey.\n` +
      `📲 Bloquez votre portion dès ce soir : https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonsoir%20je%20réserve%20le%20Plat%20du%20Jour%20de%20demain%20${encodeURIComponent(name)}`;
  } else if (style === 'PRESTIGE_ROYAL') {
    whatsapp = `*👑 FESTIN GASTRONOMIQUE DU JOUR — KHADY'S FOOD 👑*\n\n` +
      `Offrez-vous un moment d'exception culinaire ce ${dateStr} avec la création signature de Cheffe Khady :\n\n` +
      `✨ *${name.toUpperCase()}* ✨\n` +
      `${desc}\n\n` +
      `🌟 *Garniture & Accompagnement de prestige :*\n` +
      `• ${acc}\n` +
      `• ${quote}\n\n` +
      `💎 *Tarif Privilège :* *${price}*\n` +
      `🛵 *Service Livraison Haute Précision par Billo Express*\n\n` +
      `👉 *Réserver votre portion VIP :*\n` +
      `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonjour%20je%20réserve%20le%20Plat%20du%20Jour%20${encodeURIComponent(name)}\n\n` +
      `_Khady's Food & Event — L'art de la haute gastronomie sahélienne_`;

    groups = `*👑 DÉLICE ROYAL DU JOUR — KHADY'S FOOD 👑*\n\n` +
      `Chers gourmets, le plat d'exception du jour est prêt :\n` +
      `🌟 *${name}*\n` +
      `✨ ${desc}\n` +
      `🎁 Servi avec ${acc}\n\n` +
      `💰 Offre exclusive : *${price}*\n` +
      `🛵 Service traiteur et livraison sur tout Niamey.\n` +
      `👉 Commandes : https://wa.me/${RESTAURANT_INFO.whatsappClean}`;

    social = `👑 𝐋'𝐄𝐗𝐂𝐄𝐋𝐋𝐄𝐍𝐂𝐄 𝐃𝐔 𝐉𝐎𝐔𝐑 | 𝐊𝐇𝐀𝐃𝐘'𝐒 𝐅𝐎𝐎𝐃 👑\n\n` +
      `L'art culinaire au Sahel sublimé par Cheffe Khady.\n` +
      `Aujourd'hui, découvrez notre *${name}*, une recette noble mijotée avec passion et des ingrédients de premier choix.\n\n` +
      `🌟 ${desc}\n` +
      `✨ ${acc}\n\n` +
      `Prix Spécial : ${price}\n` +
      `🛵 Disponible dès maintenant en livraison ou à emporter.\n` +
      `📲 Réservations : ${RESTAURANT_INFO.whatsapp}\n\n` +
      `#KhadyFood #HauteGastronomie #PlatDuJour #Niamey #Niger #ChefKhady #ExcellenceCulinaire`;

    eveningTeaser = `👑 *AVANT-PREMIÈRE DE LA VEILLE — AU MENU ${targetDay.toUpperCase()}* 👑\n\n` +
      `Cheffe Khady a l'honneur de vous dévoiler le menu d'exception de demain :\n` +
      `✨ *${name.toUpperCase()}* ✨\n` +
      `${desc}\n\n` +
      `🌟 *Service exclusif avec :* ${acc}\n` +
      `💎 *Tarif Privilège :* ${price}\n\n` +
      `🛵 Réservé aux amateurs de gastronomie sahélienne. Livré à l'heure exacte de votre déjeuner à Niamey.\n` +
      `👉 *Précommandez votre repas VIP dès ce soir :*\n` +
      `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonsoir%20je%20réserve%20le%20Plat%20Royal%20de%20demain%20${encodeURIComponent(name)}`;
  } else {
    // Default GOURMAND
    whatsapp = `*🍲 LE PLAT DU JOUR EST PRÊT CHEZ KHADY'S FOOD ! 🍲*\n\n` +
      `Aujourd'hui (${dateStr}), faites frémir vos papilles avec notre :\n` +
      `✨ *${name.toUpperCase()}* ✨\n\n` +
      `😋 ${desc}\n` +
      `🍌 *Accompagnements inclus :* ${acc}\n` +
      `${quote}\n\n` +
      `💰 *Tarif Spécial du Jour :* *${price}* (au lieu de ${originalPrice})\n` +
      `🛵 *Livraison express* chaude et soignée partout à Niamey par Billo Express.\n` +
      `⚡ *Portions limitées :* ${stock} parts cuisinées ce matin !\n\n` +
      `👉 *Cliquez ici pour commander sur WhatsApp :*\n` +
      `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonjour%20je%20souhaite%20commander%20le%20Plat%20du%20Jour%20${encodeURIComponent(name)}\n\n` +
      `_Khady's Food & Event — Le goût du bonheur au Sahel_`;

    groups = `*🍲 BONJOUR LE GROUPE ! LE DÉJEUNER EST SERVI 🍲*\n\n` +
      `Les délicieux arômes de Cheffe Khady sont de sortie !\n` +
      `Au menu aujourd'hui : *${name}*\n` +
      `👉 ${acc}\n\n` +
      `🔥 Prix spécial : *${price}* seulement.\n` +
      `🛵 Livraison rapide à votre porte par Billo !\n` +
      `📲 Pour commander : https://wa.me/${RESTAURANT_INFO.whatsappClean}`;

    social = `✨ 𝐏𝐋𝐀𝐓 𝐃𝐔 𝐉𝐎𝐔𝐑 | 𝐊𝐇𝐀𝐃𝐘'𝐒 𝐅𝐎𝐎𝐃 & 𝐄𝐕𝐄𝐍𝐓 ✨\n\n` +
      `Envie d'un déjeuner savoureux et généreux ?\n` +
      `Laissez-vous tenter par notre *${name}* cuisiné ce matin par Cheffe Khady ! 🥘✨\n\n` +
      `😋 ${desc}\n` +
      `🎁 ${acc}\n\n` +
      `💰 Tarif Spécial : ${price} (au lieu de ${originalPrice})\n` +
      `🛵 Livraison express partout à Niamey avec Billo Express\n` +
      `📲 Commandez directement sur WhatsApp : ${RESTAURANT_INFO.whatsapp}\n\n` +
      `#KhadyFood #PlatDuJour #Niamey #CuisineAfricaine #BilloExpress #DejeunerNiamey #FoodNiger`;

    eveningTeaser = `🌙 *AU MENU DEMAIN MIDI CHEZ KHADY'S FOOD !* 🍲✨\n\n` +
      `Chers gourmets, pour votre déjeuner de ${targetDay}, Cheffe Khady vous concocte son chef-d'œuvre :\n` +
      `👑 *${name.toUpperCase()}*\n\n` +
      `😋 ${desc}\n` +
      `🎁 *Bonus spécial précommande de nuit :* ${acc}\n` +
      `💰 *Tarif Spécial :* ${price} (au lieu de ${originalPrice})\n\n` +
      `🛵 *Livraison garantie dès 12h00 précises à votre bureau ou à domicile par Billo Express.*\n` +
      `⚠️ *Stock limité :* Réservez dès ce soir avant 23h pour être servi en priorité !\n\n` +
      `👉 *Pour réserver dès ce soir en 1 clic :*\n` +
      `https://wa.me/${RESTAURANT_INFO.whatsappClean}?text=Bonsoir%20je%20réserve%20ma%20part%20pour%20demain%20midi%20du%20Plat%20du%20Jour%20${encodeURIComponent(name)}\n\n` +
      `_Khady's Food & Event — Toujours un plaisir de vous régaler !_ 🌟`;
  }

  const hashtags = `#KhadyFood #PlatDuJour #${name.replace(/[^a-zA-Z0-9]/g, '')} #Niamey #BilloExpress #CuisineAfricaine #FoodNiger #DejeunerNiamey`;

  return { whatsapp, groups, social, eveningTeaser, hashtags };
};

// Storage for Plat du Jour
export const getStoredPlatDuJour = (): PlatDuJourConfig => {
  try {
    const data = localStorage.getItem('khadys_plat_du_jour');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.dishName) return parsed;
    }
  } catch (e) {}
  return INITIAL_PLAT_DU_JOUR;
};

export const saveStoredPlatDuJour = (plat: PlatDuJourConfig): void => {
  try {
    localStorage.setItem('khadys_plat_du_jour', JSON.stringify(plat));
  } catch (e) {}
};

// Open social media sharing
export const shareToSocialPlatform = (text: string, platform: 'facebook' | 'instagram' | 'tiktok' | 'copy' | 'web_share'): boolean => {
  const url = `https://wa.me/${RESTAURANT_INFO.whatsappClean}`;
  
  if (platform === 'facebook') {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(fbUrl, '_blank');
    return true;
  } else if (platform === 'instagram') {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    window.open(RESTAURANT_INFO.socials.instagram.url, '_blank');
    return true;
  } else if (platform === 'tiktok') {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    window.open(RESTAURANT_INFO.socials.tiktok.url, '_blank');
    return true;
  } else if (platform === 'web_share' && navigator.share) {
    navigator.share({
      title: 'Plat du Jour - Khady\'s Food Niamey',
      text: text,
      url: url
    }).catch(() => {});
    return true;
  }
  
  // Default: copy to clipboard
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
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
