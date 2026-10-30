import type { Order } from '@/lib/api/types';

export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
export const isObjectId = (value: string) => OBJECT_ID_REGEX.test(value.trim());

export function formatInr(amount: number | undefined | null) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(d);
}

export function formatDateTime(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

/** Human order number: the admin-assigned ID when present, else a short hash of the DB id. */
export function displayOrderId(order: Pick<Order, '_id' | 'orderId'>) {
  return order.orderId || `#${order._id.slice(-6).toUpperCase()}`;
}

export const ORDER_STEPS: Array<{ key: Order['orderStatus']; label: string; hint: string }> = [
  { key: 'placed', label: 'Order placed', hint: 'We have received your order.' },
  { key: 'processing', label: 'Being packed', hint: 'Freshly packed in our kitchen.' },
  { key: 'shipped', label: 'Shipped', hint: 'Handed to the courier partner.' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy your Vrateez treats.' },
];

export function orderStepIndex(status: Order['orderStatus']) {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function paymentMethodLabel(method: string) {
  switch (method) {
    case 'cod':
      return 'Cash on Delivery';
    case 'razorpay':
      return 'Paid online (Razorpay)';
    case 'upi':
      return 'UPI';
    case 'card':
      return 'Card';
    case 'netbanking':
      return 'Net banking';
    default:
      return method;
  }
}

export const LAST_ORDER_KEY = 'vrateez_last_order';

export function rememberLastOrder(orderId: string, email: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderId, email, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function recallLastOrder(): { orderId: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { orderId?: string; email?: string };
    if (!parsed.orderId) return null;
    return { orderId: parsed.orderId, email: parsed.email || '' };
  } catch {
    return null;
  }
}
