/**
 * Thin wrappers over GA4 (gtag) and Meta Pixel (fbq). Both are optional: nothing is
 * sent unless the matching script was loaded by <Analytics /> after cookie consent.
 */
import type { Order } from '@/lib/api/types';

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export function trackEvent(name: string, params: Params = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* ignore */
  }
}

export function trackPixel(name: string, params: Params = {}, custom = false) {
  if (typeof window === 'undefined') return;
  try {
    window.fbq?.(custom ? 'trackCustom' : 'track', name, params);
  } catch {
    /* ignore */
  }
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;
  try {
    if (GA_MEASUREMENT_ID) window.gtag?.('config', GA_MEASUREMENT_ID, { page_path: path });
    window.fbq?.('track', 'PageView');
  } catch {
    /* ignore */
  }
}

type CartLike = { id: string | number; name: string; price: number; quantity?: number };

export function trackAddToCart(item: CartLike) {
  const quantity = item.quantity ?? 1;
  const value = item.price * quantity;
  trackEvent('add_to_cart', {
    currency: 'INR',
    value,
    items: [{ item_id: String(item.id), item_name: item.name, price: item.price, quantity }],
  });
  trackPixel('AddToCart', {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: 'product',
    value,
    currency: 'INR',
  });
}

export function trackBeginCheckout(items: CartLike[], value: number) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
    items: items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity ?? 1 })),
  });
  trackPixel('InitiateCheckout', {
    content_ids: items.map((i) => String(i.id)),
    content_type: 'product',
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value,
    currency: 'INR',
  });
}

export function trackViewItem(item: CartLike & { category?: string }) {
  trackEvent('view_item', {
    currency: 'INR',
    value: item.price,
    items: [{ item_id: String(item.id), item_name: item.name, price: item.price, item_category: item.category }],
  });
  trackPixel('ViewContent', {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: 'product',
    value: item.price,
    currency: 'INR',
  });
}

/** Fire once per order, even if the success page is reloaded. */
export function trackPurchase(order: Order) {
  if (typeof window === 'undefined') return;
  const key = `vrateez_purchase_${order._id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
  const items = order.items.map((i) => ({
    item_id: String(i.product),
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));
  trackEvent('purchase', {
    transaction_id: order._id,
    value: order.totalAmount,
    currency: 'INR',
    shipping: order.shippingCharge,
    coupon: order.couponCode || undefined,
    payment_type: order.paymentMethod,
    items,
  });
  trackPixel('Purchase', {
    value: order.totalAmount,
    currency: 'INR',
    content_ids: items.map((i) => i.item_id),
    content_type: 'product',
    num_items: items.reduce((n, i) => n + i.quantity, 0),
  });
}

export function trackLead(source: string) {
  trackEvent('generate_lead', { source });
  trackPixel('Lead', { content_name: source });
}
