
import { District, MenuItem, Review } from './types';

export const DELIVERY_TIME = "25 à 45 mn";
export const ADMIN_PASSWORD = "khadysfood";
// Utilisation du logo fourni par l'utilisateur
export const LOGO_URL = "https://i.ibb.co/h1rgJJMb/1766933626062.jpg"; 
export const LOGO_VIDEO_URL = "https://v.ft-static.com/video/469c3a3809e5b7226252994c5026210b/downloads/default.mp4";
export const BILLO_LOGO_URL = "https://i.ibb.co/YFftbm2X/1765927283591.jpg";

export const BILLO_INFO = {
  name: "Billo Express",
  slogan: "L'éclair de Niamey",
  phone: "+227 92 08 08 22",
  whatsapp: "+227 92 08 08 22",
  whatsappClean: "22792080822",
  tarifs: {
    center: { day: 1000, night: 1500 },
    periphery: { day: 1500, night: 2000 }
  },
  fridayRule: "Livraisons suspendues le vendredi de 12h à 15h pour la grande prière."
};

export const RESTAURANT_INFO = {
  name: "Khady's Food & Event",
  slogan: "L'excellence en un clic",
  phones: ["+227 74 44 16 21", "+227 96 05 23 10", "+227 90 40 51 18"],
  whatsapp: "+227 74 44 16 21",
  whatsappClean: "22774441621",
  directLine: "+227 96 05 23 10",
  directLineClean: "22796052310",
  depositNumbers: {
    group1: "+227 90 40 51 18", // MyNita, Nita transfert, Amanata, Amana transfert, All-Iza Business, Zamany Money
    airtel: "+227 96 05 23 10", // Airtel Money
    moov: "+227 74 44 16 21"   // Moov Money / Flooz
  },
  location: "Plateau, Niamey",
  socials: {
    facebook: {
      handle: "@Khady's Food & Event",
      url: "https://www.facebook.com/profile.php?id=615500000000000" // Facebook link fallback or search
    },
    instagram: {
      handle: "@khadys_food",
      url: "https://www.instagram.com/khadys_food"
    },
    tiktok: {
      handle: "@khadys.food.event",
      url: "https://www.tiktok.com/@khadys.food.event"
    }
  }
};

export const MENU_ITEMS: MenuItem[] = [
  // --- SPÉCIALITÉS & MENU DU JOUR ---
  { id: 'sp1', name: 'Tiep Royal Khady', description: 'Le chef-d\'œuvre de la maison au poisson capitaine, riz rouge parfumé et légumes fondants.', price: 5500, image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800', category: 'Spécialité Maison', rating: 5, isAvailable: true, isSpicy: true },
  { id: 'sp2', name: 'Plateau Prestige Event', description: 'Assortiment giga de grillades, pastels et alloco pour 4 personnes.', price: 15000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', category: 'Spécialité Maison', rating: 5, isAvailable: true },
  { id: 'dj1', name: 'Dambou du Jour', description: 'Couscous de moringa frais aux arachides grillées, servi avec du poulet braisé.', price: 2500, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', category: 'Menu du Jour', rating: 4.9, isAvailable: true, isVegetarian: true, isLowPrice: true },
  { id: 'dj2', name: 'Riz au Gras Niamey', description: 'Riz savoureux cuit dans un bouillon de viande et épices locales.', price: 2000, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800', category: 'Menu du Jour', rating: 4.7, isAvailable: true, isLowPrice: true },

  // --- PETIT-DÉJEUNER ---
  { id: 'pd1', name: 'Café Touba & Beignets Dounguiri', description: 'Café traditionnel sénégalais épicé au poivre de Selim, accompagné de succulents beignets doux de mil frits.', price: 1500, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800', category: 'Petit-déjeuner', rating: 4.9, isAvailable: true, isLowPrice: true },
  { id: 'pd2', name: 'Bouillie de Mil au Lait Caillé', description: 'Onctueuse bouillie traditionnelle de mil (Thiacry / Dégué chaud) agrémentée de miel sauvage, lait caillé crémeux et éclats de coco.', price: 2000, image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=800', category: 'Petit-déjeuner', rating: 4.8, isAvailable: true, isVegetarian: true },
  { id: 'pd3', name: 'Omelette Sahélienne & Tapalapa', description: 'Deux œufs garnis aux oignons caramélisés, piments doux, tomates fraîches, le tout servi avec le pain traditionnel Tapalapa chaud.', price: 2500, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', category: 'Petit-déjeuner', rating: 4.7, isAvailable: true },

  // --- DÉJEUNER ---
  { id: 'kit1', name: 'Kit-Déjeuner Complet', description: 'Formule royale équilibrée : 1 Plat du Jour généreux, 1 Jus Naturel de votre choix (Bissap, Bouye, Gingembre), 1 Salade de fruits frais de saison, et 1 bidon d\'eau minérale fraîche. (Livraison non incluse).', price: 5000, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', category: 'Déjeuner', rating: 5, isAvailable: true },
  { id: 'lc1', name: 'Garba Ivoirien Classique', description: 'La formule ultime d\'attiéké (semoule de manioc cuite à la vapeur) servie avec du thon frit doré, du piment frais haché et des oignons croquants.', price: 3500, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', category: 'Déjeuner', rating: 5, isAvailable: true },
  { id: 'lc2', name: 'Yassa au Poulet Mariné', description: 'Cuisse de poulet fermier braisée, nappée d\'une sauce fondante aux oignons caramélisés, citron vert et moutarde de Dijon, livrée avec du riz cassé parfumé.', price: 4000, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', category: 'Déjeuner', rating: 4.8, isAvailable: true },

  // --- DÎNER ---
  { id: 'dn1', name: 'Soupou Kandia Royal', description: 'Un ragoût d\'okra traditionnel extrêmement riche en crevettes fraîches, crabe, poisson fumé et morceaux de bœuf tendre, lié à l\'huile de palme rouge fine, servi sur riz blanc royal.', price: 5000, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', category: 'Dîner', rating: 5, isAvailable: true, isSpicy: true },
  { id: 'dn2', name: 'Brochettes de Filet de Bœuf (Suya)', description: 'Tendres tranches de filet de bœuf marinées à l\'huile d\'arachide et aux épices Kankankan (piment rouge, gingembre, arachide torréfiée), grillées au feu de bois.', price: 4000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', category: 'Dîner', rating: 4.9, isAvailable: true, isSpicy: true },
  { id: 'dn3', name: 'Saka Saka de Kinshasa', description: 'Mijoté de feuilles de manioc finement pilées avec du poisson capitaine fumé, de la viande de bœuf séchée et de la pâte d\'arachide onctueuse, accompagné de riz parfumé.', price: 4500, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', category: 'Dîner', rating: 4.7, isAvailable: true },

  // --- ENTRÉES ---
  { id: 'en1', name: 'Pastels au Thon (6pcs)', description: 'Délicieux petits chaussons frits garnis de thon mi-cuit émietté aux oignons et herbes aromatiques, accompagnés de notre sauce tomate piquante de la Chef.', price: 1500, image: 'https://images.unsplash.com/photo-1601050638917-3f80bc61a4bb?w=800', category: 'Entrée', rating: 4.8, isAvailable: true, isLowPrice: true },
  { id: 'en2', name: 'Pastels à la Viande Hachée (6pcs)', description: 'Chaussons frits farcis d\'une viande hachée tendre, persillée, subtilement relevée aux herbes du Sahel, avec leur sauce piquante.', price: 2000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', category: 'Entrée', rating: 4.9, isAvailable: true },
  { id: 'en3', name: 'Aloco de Grand-Bassam', description: 'Bananes plantains bien mûres découpées en dés et frites dans une huile végétale fine, dorées à souhait, accompagnées d\'une sauce pimentée Khady.', price: 1500, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800', category: 'Entrée', rating: 5, isAvailable: true, isLowPrice: true },
  { id: 'en4', name: 'Salade Sahel Fraîcheur', description: 'Mélange craquant de laitue romaine, concombres, tomates cerises, maïs grillé au beurre de karité et vinaigrette légère au miel de Niamey.', price: 1800, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', category: 'Entrée', rating: 4.6, isAvailable: true, isVegetarian: true },

  // --- BOISSONS NATURELLES ---
  { id: 'bo1', name: 'Bissap Rouge Glacé Royal', description: 'Infusion fraîche et royale de fleurs d\'hibiscus sabdariffa du Niger, parfumée à la menthe douce saharienne et au jus d\'ananas pressé.', price: 500, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800', category: 'Boisson Naturelle', rating: 5, isAvailable: true, isLowPrice: true },
  { id: 'bo2', name: 'Jus de Bouye Onctueux', description: 'Jus naturel crémeux extrait de la pulpe du pain de singe (fruit du baobab), infusé à l\'extrait naturel de vanille de Madagascar et muscade râpée.', price: 1000, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', category: 'Boisson Naturelle', rating: 4.9, isAvailable: true },
  { id: 'bo3', name: 'Jus de Gingembre Tonique', description: 'Nectar de gingembre frais pressé à froid, adouci par du citron vert et du pur miel sauvage, extrêmement rafraîchissant.', price: 800, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800', category: 'Boisson Naturelle', rating: 4.8, isAvailable: true },
  { id: 'bo4', name: 'Jus de Tamarin Douceur', description: 'Boisson rafraîchissante et acidulée à base de tamarin sauvage purifié, légèrement sucrée et infusée d\'eau de rose.', price: 800, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800', category: 'Boisson Naturelle', rating: 4.7, isAvailable: true },

  // --- PLATS AFRICAINS TRANSVERSAUX ---
  { id: 'af3', name: 'Attiéké Poisson Capitaine', description: 'Semoule de manioc cuite, darne de poisson capitaine braisée au bois d\'acacia, oignons blancs et poivrons marinés.', price: 5000, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', category: 'Plat Africain', rating: 5, isAvailable: true },

  // --- DESSERTS ---
  { id: 'de1', name: 'Dégué Royal', description: 'Couscous de mil au yaourt onctueux d\'Afrique de l\'Ouest, miel, éclats de coco séchée.', price: 1500, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', category: 'Dessert', rating: 4.9, isAvailable: true, isLowPrice: true },

  // --- BOX SAUCES (Min 10) ---
  { id: 'bx1', name: 'Box Sauce Mafé', description: 'Onctueuse sauce à l\'arachide pré-cuite, prête à réchauffer pour napper vos riz. Format familial 1L.', price: 4500, image: 'https://images.unsplash.com/photo-1541518763531-4a949439a3f8?w=800', category: 'Box Sauce', rating: 4.8, isAvailable: true },
  { id: 'bx2', name: 'Box Sauce Gombo', description: 'Sauce gombo riche de la Chef Khady mijotée avec morceaux de bœuf tendre et poisson fumé.', price: 5000, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', category: 'Box Sauce', rating: 4.9, isAvailable: true, isSpicy: true },
  { id: 'bx3', name: 'Box Base Yassa', description: 'Mijoté d\'oignons caramélisés au citron jaune acidulé et poivre de Kampot pour vos yassa express.', price: 3500, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a7c41eb?w=800', category: 'Box Sauce', rating: 4.7, isAvailable: true },
  { id: 'bx4', name: 'Box Sauce Kopto', description: 'Sauce traditionnelle à base de feuilles de moringa infusées à la pâte d\'arachide grillée et oignons.', price: 4000, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', category: 'Box Sauce', rating: 5, isAvailable: true, isVegetarian: true },
  { id: 'bx8', name: 'Box Piment Feu d\'Afrique', description: 'Purée homogène de piment de Cayenne extra fort et d\'épices secrètes de la maison Khady.', price: 2000, image: 'https://images.unsplash.com/photo-1516824467704-9d4199c98607?w=800', category: 'Box Sauce', rating: 5, isAvailable: true, isSpicy: true },

  // --- PACK-BUFFET (Événements) ---
  { id: 'pb1', name: 'Pack Buffet Mariage', description: 'Buffet complet pour 50 personnes avec entrées, plats de célébration, desserts et service traiteur inclus.', price: 250000, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', category: 'Pack-Buffet', rating: 5, isAvailable: true, minPeople: 50 },
  { id: 'pb2', name: 'Pack Buffet Anniversaire', description: 'Buffet festif adapté pour 20 personnes, incluant grillades, riz locaux, gâteau d\'anniversaire et boissons.', price: 120000, image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800', category: 'Pack-Buffet', rating: 4.9, isAvailable: true, minPeople: 20 },
  { id: 'pb3', name: 'Pack Buffet Corporate', description: 'Une séléction raffinée pour 30 personnes pour vos séminaires, réunions, buffets debout ou assis avec serveurs.', price: 180000, image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800', category: 'Pack-Buffet', rating: 5, isAvailable: true, minPeople: 30 }
];

export const DISTRICTS: District[] = [
  // CENTRE
  { name: 'Plateau', zone: 'center' },
  { name: 'Yantala', zone: 'center' },
  { name: 'Kouara Kano', zone: 'center' },
  { name: 'Lacouroussou', zone: 'center' },
  { name: 'Dar-Es-Salam', zone: 'center' },
  { name: 'Bobiel', zone: 'center' },
  { name: 'Terminus', zone: 'center' },
  { name: 'Cité Fayçal', zone: 'center' },
  { name: 'Danyassé', zone: 'center' },
  { name: 'Boukoki', zone: 'center' },
  { name: 'Poudrière', zone: 'center' },
  { name: 'Wadata', zone: 'center' },
  
  // PÉRIPHÉRIE
  { name: 'Goudel', zone: 'periphery' },
  { name: 'Niamey 2000', zone: 'periphery' },
  { name: 'Saga', zone: 'periphery' },
  { name: 'Aéroport', zone: 'periphery' },
  { name: 'Kalley Est', zone: 'periphery' },
  { name: 'Gamkallé', zone: 'periphery' },
  { name: 'Karadjé', zone: 'periphery' },
  { name: 'Kirkissoye', zone: 'periphery' },
  { name: 'Lamordé', zone: 'periphery' },
  { name: 'Nogaré', zone: 'periphery' },
  { name: 'Soudouré', zone: 'periphery' },
  { name: 'Koiratégui', zone: 'periphery' }
];

export const TRAITEUR_CONDITIONS = [
  { title: 'Réservation', detail: 'Préavis minimum de 72h requis.' },
  { title: 'Acompte', detail: '50% à verser à la commande.' },
  { title: 'Livraison', detail: 'Inclus dans tout Niamey.' },
  { title: 'Prestation', detail: 'Personnel de service sur demande.' }
];

export const POINTS_PER_1000 = 100; // 100 points pour 1000 F dépensés
export const DISCOUNT_PER_100_POINTS = 100; // 100 points = 100 F de réduction

export const REWARDS = [
  { id: 'r1', name: 'Réduction 1000 F', cost: 1000, description: '1000 F de réduction sur votre commande.' },
  { id: 'r2', name: 'Pastels Gratuits', cost: 1500, description: 'Une portion de 6 pastels offerte.' },
  { id: 'r3', name: 'Bissap Royal Offert', cost: 500, description: 'Un Bissap rouge glacé de 50cl offert.' },
  { id: 'r4', name: 'Livraison Gratuite', cost: 2000, description: 'Frais de livraison offerts pour votre commande.' }
];

export const REVIEWS: Review[] = [
  { 
    id: '1', 
    name: 'Abdou R.', 
    comment: 'Le Tiep est juste magnifique ! Livraison Billo rapide au Plateau, encore chaud à l\'arrivée.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 
    date: 'Aujourd\'hui',
    adminReply: 'Barka Abdou ! C\'est un plaisir de vous savoir satisfait. À très bientôt pour un autre festin ! ✨'
  },
  { 
    id: '2', 
    name: 'Mariama K.', 
    comment: 'Les Box Sauces ont sauvé mon dîner de famille. La sauce Mafé est onctueuse, comme au village.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 
    date: 'Hier',
    adminReply: 'Fofo Mariama ! C\'est exactement pour ces moments que nous avons créé les Box. Merci pour votre confiance. ❤️'
  },
  { 
    id: '3', 
    name: 'Issoufou Z.', 
    comment: 'Excellent service traiteur pour notre cocktail pro. Présentation soignée et goût au rendez-vous.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 
    date: 'Il y a 2 jours',
    adminReply: 'Barka Issoufou ! Toute l\'équipe vous remercie. Nous sommes ravis d\'avoir contribué au succès de votre événement. 🤝'
  }
];
