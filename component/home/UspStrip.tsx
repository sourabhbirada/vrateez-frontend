'use client';

import { Banknote, Dumbbell, Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function UspStrip() {
  const { settings } = useSettings();
  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const cod = settings?.shipping?.paymentMethods?.cod ?? true;

  const items = [
    { icon: Dumbbell, title: 'High protein', sub: 'Millet, nuts & seeds' },
    { icon: Leaf, title: 'Zero added sugar', sub: 'Naturally sweet' },
    { icon: Sprout, title: 'Vrat friendly', sub: 'No onion, no garlic' },
    { icon: ShieldCheck, title: 'FSSAI certified', sub: 'Clean label, no palm oil' },
    { icon: Truck, title: `Free delivery ₹${threshold}+`, sub: 'Pan-India shipping' },
    cod ? { icon: Banknote, title: 'Cash on delivery', sub: 'Pay at your door' } : { icon: Banknote, title: 'UPI & cards', sub: 'Secured by Razorpay' },
  ];

  return (
    <section aria-label="Why shop with Vrateez" className="bg-ink text-parchment border-y border-parchment/10">
      <ul className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-parchment/10">
        {items.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-millet/15 text-millet">
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight truncate">{title}</p>
              <p className="text-[11px] text-parchment/50 leading-tight truncate">{sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
