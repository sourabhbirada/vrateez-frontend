'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Check, Gift, Package, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useProducts } from '@/context/CatalogContext';
import type { Product } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { formatInr } from '@/lib/orderUtils';

/** Curated boxes: one click adds every item. Each box clears the free-delivery threshold. */
const BUNDLES = [
  {
    key: 'protein-starter',
    title: 'Protein Starter Box',
    tagline: 'Our three most-loved bakes, one order.',
    badge: 'Most popular',
    slugs: ['almond-vital-energy', 'blueberry-infused-cookies', 'energy-bar'],
  },
  {
    key: 'vrat-essentials',
    title: 'Vrat Essentials Box',
    tagline: 'Savoury, sweet and quick meals for a fasting week.',
    badge: 'Festive pick',
    slugs: ['instant-sama-upma', 'classic-masala-makhana', 'minty-makhana', 'falahaari-crunchy-bites', 'falahaari-chips', 'energy-bar'],
  },
  {
    key: 'cookie-lovers',
    title: "Cookie Lover's Box",
    tagline: 'Four flavours, zero added sugar. Gift-ready.',
    badge: 'Gift ready',
    slugs: ['walnut-brain-harmony', 'cashew-cardio-balance', 'coconut-pure-delights', 'cranberry-infused-cookies'],
  },
];

export default function BundlesSection() {
  const { addToCart, openCart } = useCart();
  const { settings } = useSettings();
  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const { products } = useProducts();
  const [added, setAdded] = useState<string | null>(null);

  const boxes = useMemo(() => {
    const bySlug = new Map(products.filter((p) => p.isActive !== false).map((p) => [p.slug, p]));
    return BUNDLES.map((b) => {
      const items = b.slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
      const total = items.reduce((n, p) => n + p.price, 0);
      const original = items.reduce((n, p) => n + Math.max(p.originalPrice || 0, p.price), 0);
      return { ...b, items, total, original };
    }).filter((b) => b.items.length >= 2);
  }, [products]);

  if (!boxes.length) return null;

  const addBox = (key: string, items: Product[]) => {
    items.forEach((p) =>
      addToCart({
        id: p._id,
        slug: p.slug,
        name: p.name,
        image: p.image,
        price: p.price,
        originalPrice: p.originalPrice,
        weight: p.weight,
        freeDelivery: p.freeDelivery,
      }),
    );
    setAdded(key);
    openCart();
    window.setTimeout(() => setAdded(null), 1800);
  };

  return (
    <section className="relative bg-[#EFE6D3] py-16 md:py-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.05] mix-blend-multiply" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12" data-reveal>
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-3">Boxes that ship free</p>
          <h2 className="font-display italic text-4xl md:text-5xl text-ink leading-none">Pick a box, skip the thinking.</h2>
          <p className="mt-4 text-[15px] text-ink/55">
            Each box clears the ₹{threshold} free-delivery mark. One tap adds everything to your cart. Swap items any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {boxes.map((box, i) => {
            const freeShip = box.total >= threshold;
            const isAdded = added === box.key;
            return (
              <article key={box.key} data-reveal data-reveal-delay={String(i * 110)} className="group relative flex flex-col rounded-[24px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6 shadow-[0_24px_60px_-40px_rgba(36,31,22,0.5)] transition hover:-translate-y-1">
                <span className="absolute top-4 right-4 rounded-full bg-ink text-parchment font-label text-[9px] tracking-[0.16em] uppercase px-2.5 py-1">
                  {box.badge}
                </span>

                <div className="flex -space-x-4 mb-5">
                  {box.items.slice(0, 4).map((p, i) => (
                    <div
                      key={p._id}
                      className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-2xl ring-4 ring-white bg-parchment shadow"
                      style={{ zIndex: 10 - i, transform: `rotate(${(i - 1.5) * 4}deg)` }}
                    >
                      <Image src={resolveImage(p.image)} alt={p.name} fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                  {box.items.length > 4 ? (
                    <div className="relative z-0 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl ring-4 ring-white bg-ink text-parchment text-sm font-semibold">
                      +{box.items.length - 4}
                    </div>
                  ) : null}
                </div>

                <h3 className="font-display text-2xl text-ink leading-tight">{box.title}</h3>
                <p className="mt-1 text-sm text-ink/55">{box.tagline}</p>

                <ul className="mt-4 space-y-1.5">
                  {box.items.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex items-center gap-2 text-ink/80 truncate">
                        <Check size={13} className="shrink-0 text-basil" strokeWidth={2.5} />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <span className="shrink-0 text-ink/45">{formatInr(p.price)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-end justify-between border-t border-ink/[0.08] pt-4">
                  <div>
                    <p className="font-label text-[10px] tracking-[0.16em] uppercase text-ink/45">Box total</p>
                    <p className="font-display text-3xl text-ink leading-none mt-1">{formatInr(box.total)}</p>
                    {box.original > box.total ? <p className="text-xs text-ink/40 line-through mt-0.5">{formatInr(box.original)}</p> : null}
                  </div>
                  {freeShip ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-basil/10 text-basil px-3 py-1.5 text-xs font-semibold">
                      <Truck size={13} /> Free delivery
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => addBox(box.key, box.items)}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition ${
                    isAdded ? 'bg-basil text-parchment' : 'bg-ink text-parchment hover:bg-turmeric'
                  }`}
                >
                  {isAdded ? <Check size={16} strokeWidth={2.5} /> : <ShoppingBag size={16} />}
                  {isAdded ? 'Added to cart' : 'Add box to cart'}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-ink/50">
          <span className="inline-flex items-center gap-1.5"><Package size={13} className="text-clay" /> Packed fresh to order</span>
          <span className="inline-flex items-center gap-1.5"><Gift size={13} className="text-clay" /> Add a gift note at checkout</span>
          <span className="inline-flex items-center gap-1.5"><Truck size={13} className="text-clay" /> Pan-India in {settings?.shipping?.deliveryDays || '3 to 7 days'}</span>
        </div>
      </div>
    </section>
  );
}
