import { fetchSettings } from '@/lib/server/catalog';

export const POLICY_UPDATED = '1 November 2026';
export const LEGAL_NAME = 'Vrateez Foods Pvt. Ltd.';

/** Contact and shipping facts for policy pages, from CMS Settings with safe defaults. */
export async function getStoreFacts() {
  const settings = await fetchSettings();
  const contact = settings?.contact;
  const shipping = settings?.shipping;
  const whatsappDigits = String(contact?.whatsapp || '+916375010189').replace(/\D/g, '');
  return {
    email: contact?.supportEmail || 'support@vrateez.com',
    phone: contact?.phone || '+91-70700 88100',
    whatsappDigits,
    whatsappDisplay: whatsappDigits.length === 12 ? `+${whatsappDigits.slice(0, 2)} ${whatsappDigits.slice(2, 7)} ${whatsappDigits.slice(7)}` : `+${whatsappDigits}`,
    address: contact?.address || 'Jaipur, Rajasthan, India',
    freeShippingThreshold: shipping?.freeShippingThreshold ?? 499,
    shippingFee: shipping?.standardShippingFee ?? 49,
    deliveryDays: shipping?.deliveryDays || '3-5 business days',
    cod: shipping?.paymentMethods?.cod ?? true,
  };
}
