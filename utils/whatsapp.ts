import { Order, CartItem, MenuItem, TraiteurPackage } from '../types';
import { RESTAURANT_INFO } from '../constants';

export function generateWhatsAppOrderLink(order: Order): string {
  const itemsText = order.items
    .map(ci => `• ${ci.quantity}x *${ci.item.name}* (${(ci.item.price * ci.quantity).toLocaleString()} FCFA)${ci.spice ? ` [Piment: ${ci.spice}]` : ''}${ci.notes ? ` (Note: ${ci.notes})` : ''}`)
    .join('\n');

  const text = `🍽️ *NOUVELLE COMMANDE KHADY'S FOOD* 🍽️
Référence: #${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}

👤 *Client:* ${order.customerName}
📞 *Téléphone:* ${order.phone}
📍 *Quartier:* ${order.district}
🏠 *Adresse exacte:* ${order.address}
${order.notes ? `📝 *Remarques:* ${order.notes}\n` : ''}
📋 *Articles commandés:*
${itemsText}

💰 *Sous-total:* ${order.subtotal.toLocaleString()} FCFA
🛵 *Frais de livraison:* ${order.deliveryFee.toLocaleString()} FCFA
⭐ *TOTAL À RÉGLER:* *${order.totalAmount.toLocaleString()} FCFA*
💳 *Mode de paiement:* ${order.paymentMethod.toUpperCase()}

_Merci de confirmer la prise en charge et le délai de livraison._`;

  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppTraiteurLink(
  pkg: TraiteurPackage,
  details: { guestCount: number; date: string; location: string; name: string; phone: string; notes?: string }
): string {
  const totalEstime = (pkg.pricePerPerson * details.guestCount).toLocaleString();

  const text = `🎉 *DEMANDE DE DEVIS SERVICE TRAITEUR KHADY'S EVENT* 🎉

Formule choisie: *${pkg.title}*
Prix indicatif: ${pkg.pricePerPerson.toLocaleString()} FCFA / invité
Nombre de convives: *${details.guestCount} personnes*
Budget estimatif: *~${totalEstime} FCFA*

📅 *Date de l'événement:* ${details.date}
📍 *Lieu / Salle:* ${details.location}
👤 *Nom:* ${details.name}
📞 *Contact:* ${details.phone}
${details.notes ? `💬 *Souhaits spécifiques:* ${details.notes}` : ''}

Bonjour l'équipe Khady's Event, je souhaite recevoir une proposition détaillée et échanger sur notre réception.`;

  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function shareDishOnWhatsApp(item: MenuItem): void {
  const text = `Découvre ce délicieux plat chez *KHADY'S FOOD* à Niamey :
🍛 *${item.name}* (${item.price.toLocaleString()} FCFA)
"${item.description}"
👉 Commande directement avec livraison rapide à Niamey !`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
