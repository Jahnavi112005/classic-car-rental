const WA_NUMBER = '919036444477';

export function getWhatsAppUrl(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function whatsAppUrl(vehicle?: string, pickupDate?: string, dropDate?: string) {
  const msg = `Hello Classic Car Rentals,\n\nI would like to book a vehicle.\nVehicle: ${vehicle || ''}\nPickup Date: ${pickupDate || ''}\nDrop Date: ${dropDate || ''}\n\nPlease share availability and pricing.`;
  return getWhatsAppUrl(msg);
}

export const defaultWhatsAppMsg = `Hello Classic Car Rentals,\n\nI would like to book a vehicle.\nVehicle: \nPickup Date: \nDrop Date: \n\nPlease share availability and pricing.`;

