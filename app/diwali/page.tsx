'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Gift, Heart, Leaf, Minus, Package, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { getDealsApi } from '@/lib/api/dealApi';
import { getProductBySlugApi } from '@/lib/api/productApi';
import type { Deal, Product } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';

const FALLBACK_LANDING_DEAL: Deal = {
  _id: 'fallback-diwali-landing',
  title: 'Diwali Gift Hamper',
  subtitle: 'Celebrate the festival of lights with a healthy gift!',
  description:
    'To health and happiness, Vrateez brings you the warmth of Diwali wrapped in delicious treats. Each hamper includes energy bars, cookies, millet bites, decorative diyas & a festive greeting card.',
  badge: 'LIMITED TIME OFFER',
  cta: 'Order Now',
  ctaLink: '/product/diwali-gift-hamper',
  image: '/diwaligift.png',
  video: '/diwalivideo.mp4',
  price: 379,
  originalPrice: 499,
  items: ['Energy Bar', 'Coconut Cookies', 'Dry Fruit Cookies', 'Millet Bites', 'Decorative Diyas', 'Festive Greeting Card'],
  productSlug: 'diwali-gift-hamper',
  placement: 'landing',
  bgFrom: '#FFF5E6',
  bgTo: '#FFE8CC',
  isActive: true,
  position: 1,
};

const WHY = [
  { icon: Leaf, title: 'Guilt-free sweetness', body: 'Zero added sugar, millet-based and vrat-friendly. A hamper everyone at the table can actually eat.' },
  { icon: Heart, title: 'Made with care', body: 'Small-batch bakes with real nuts, seeds and fruit. No palm oil, no preservatives, no onion or garlic.' },
  { icon: Gift, title: 'Ready to gift', body: 'Arrives in a premium festive box with diyas and a greeting card. Unbox, hand over, done.' },
];

const TRUST = [
  { icon: Package, label: 'Premium packaging' },
  { icon: Truck, label: 'Pan-India delivery' },
  { icon: ShieldCheck, label: 'FSSAI certified' },
];

export default function DiwaliPage() {
  const [quantity, setQuantity] = useState(1);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleCart } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const deals = await getDealsApi('landing');
        const active = deals[0] || FALLBACK_LANDING_DEAL;
        if (cancelled) return;
        setDeal(active);
        if (active?.productSlug) {
          try {
            const p = await getProductBySlugApi(active.productSlug);
            if (!cancelled) setProduct(p);
          } catch {
            if (!cancelled) setProduct(null);
          }
        }
      } catch {
        if (!cancelled) setDeal(FALLBACK_LANDING_DEAL);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: product.weight,
      quantity,
      freeDelivery: product.freeDelivery,
    });
    setAdded(true);
    toggleCart();
    window.setTimeout(() => setAdded(false), 1400);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-parchment/50 text-sm font-label tracking-widest uppercase">Loading offer…</p>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-parchment/70">No festive landing deal is active right now.</p>
        <Link href="/shop" className="text-millet font-semibold underline underline-offset-4">
          Browse shop
        </Link>
      </main>
    );
  }

  const price = product?.price ?? deal.price;
  const originalPrice = product?.originalPrice ?? deal.originalPrice;
  const savings = originalPrice > price ? originalPrice - price : 0;
  const pct = savings ? Math.round((savings / originalPrice) * 100) : 0;
  const freeShip = settings?.shipping?.freeShippingThreshold ?? 499;
  const ctaHref = deal.productSlug ? `/product/${deal.productSlug}` : deal.ctaLink || '/shop';
  const heroImage = resolveImage(deal.image || undefined);

  return (
    <main className="min-h-screen bg-ink text-parchment">
      {/* Hero */}
      <section className="relative h-[58vh] md:h-[68vh] min-h-[420px] overflow-hidden">
        {deal.image ? <Image src={heroImage} alt={deal.title} fill className="object-cover" priority /> : <div className="absolute inset-0 bg-basil" />}
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/50 via-transparent to-transparent" />
        <div className="absolute inset-0 grain-overlay opacity-[0.06] mix-blend-overlay" />

        <div className="absolute inset-x-0 bottom-0 px-5 md:px-10 pb-10 md:pb-16">
          <div className="max-w-7xl mx-auto">
            {deal.badge ? (
              <span className="inline-flex items-center gap-2 mb-5 font-label text-[10px] tracking-[0.22em] uppercase text-millet bg-ink/50 backdrop-blur-md ring-1 ring-millet/30 px-3 py-1.5 rounded-full">
                <Sparkles size={11} />
                {deal.badge}
              </span>
            ) : null}
            <h1 className="font-display italic text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-[-0.015em] max-w-3xl">{deal.title}</h1>
            {deal.subtitle ? <p className="mt-4 text-base md:text-xl text-parchment/70 max-w-xl">{deal.subtitle}</p> : null}

            <div className="mt-8 inline-flex items-stretch bg-parchment text-ink rounded-2xl shadow-2xl ring-1 ring-ink/10 overflow-hidden">
              <div className="px-5 py-3.5 flex flex-col justify-center">
                <span className="font-display text-3xl leading-none">₹{price}</span>
                <span className="font-label text-[9px] tracking-[0.16em] uppercase text-ink/50 mt-1">Special price</span>
              </div>
              {savings > 0 ? (
                <div className="px-5 py-3.5 flex flex-col justify-center border-l border-ink/10">
                  <span className="font-display text-3xl leading-none text-clay">₹{savings}</span>
                  <span className="font-label text-[9px] tracking-[0.16em] uppercase text-ink/50 mt-1">You save · {pct}%</span>
                </div>
              ) : null}
              {deal.items?.length ? (
                <div className="px-5 py-3.5 flex flex-col justify-center border-l border-ink/10">
                  <span className="font-display text-3xl leading-none">{deal.items.length}</span>
                  <span className="font-label text-[9px] tracking-[0.16em] uppercase text-ink/50 mt-1">Items inside</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, #E4A93D 0%, transparent 38%), radial-gradient(circle at 90% 85%, #C4711F 0%, transparent 35%)',
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_0.85fr] gap-12 lg:gap-16 items-start">
          {/* Left: story */}
          <div className="space-y-14">
            <div className="relative aspect-video overflow-hidden rounded-[22px] ring-1 ring-parchment/15 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] bg-basil">
              {deal.video ? (
                <video controls loop playsInline poster={heroImage} className="absolute inset-0 h-full w-full object-cover">
                  <source src={deal.video} type="video/mp4" />
                </video>
              ) : deal.image ? (
                <Image src={heroImage} alt={deal.title} fill className="object-cover" />
              ) : null}
            </div>

            {deal.description ? (
              <div className="max-w-2xl">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-4">The hamper</p>
                <p className="font-display text-xl md:text-2xl leading-relaxed text-parchment/85">{deal.description}</p>
              </div>
            ) : null}

            {deal.items?.length ? (
              <div>
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-5">What&apos;s inside</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deal.items.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 rounded-2xl bg-parchment/[0.04] ring-1 ring-parchment/10 px-4 py-3.5 transition-colors hover:bg-parchment/[0.07]"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-millet/15 text-millet font-label text-[11px] ring-1 ring-millet/30">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] text-parchment/90">{item}</span>
                      <Check size={14} className="ml-auto text-millet" strokeWidth={2.5} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-5">Why gift Vrateez</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {WHY.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-2xl bg-parchment/[0.04] ring-1 ring-parchment/10 p-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-millet text-ink mb-4">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-lg text-parchment mb-1.5">{title}</h3>
                    <p className="text-sm text-parchment/55 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sticky buy box */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[22px] bg-parchment text-ink p-6 md:p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-ink/10">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-2">Order the hamper</p>
              <h2 className="font-display italic text-2xl leading-tight mb-5">{deal.title}</h2>

              <div className="flex items-end gap-3 mb-1">
                <span className="font-display text-5xl leading-none">₹{price}</span>
                {originalPrice > price ? <span className="text-base text-ink/40 line-through mb-1">₹{originalPrice}</span> : null}
              </div>
              {savings > 0 ? (
                <span className="inline-flex font-label text-[10px] tracking-[0.16em] uppercase bg-basil text-parchment px-3 py-1.5 rounded-full">
                  Save ₹{savings} · {pct}% off
                </span>
              ) : null}

              <div className="my-6 border-t border-ink/10" />

              {product ? (
                <>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <span className="font-label text-[10px] tracking-[0.16em] uppercase text-ink/50">Quantity</span>
                    <div className="inline-flex items-center rounded-full ring-1 ring-ink/15 bg-white/60">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-ink/70 hover:bg-ink/5 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-ink/70 hover:bg-ink/5 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-5">
                    <span className="text-ink/55">Total</span>
                    <span className="font-display text-xl">₹{price * quantity}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`group w-full inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-semibold text-sm shadow-lg transition-all duration-200 ${
                      added ? 'bg-basil text-parchment' : 'bg-turmeric text-parchment shadow-turmeric/25 hover:bg-clay'
                    }`}
                  >
                    {added ? <Check size={16} strokeWidth={2.5} /> : null}
                    {added ? 'Added to cart' : 'Add to cart'}
                    {!added ? <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /> : null}
                  </button>
                </>
              ) : (
                <Link
                  href={ctaHref}
                  className="group w-full inline-flex items-center justify-center gap-2.5 bg-turmeric text-parchment px-7 py-4 rounded-full font-semibold text-sm shadow-lg shadow-turmeric/25 transition-all duration-200 hover:bg-clay"
                >
                  {deal.cta || 'View offer'}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}

              <ul className="mt-6 space-y-2.5">
                {TRUST.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-ink/65">
                    <Icon size={15} className="text-basil" strokeWidth={1.75} />
                    {label}
                  </li>
                ))}
                <li className="flex items-center gap-2.5 text-sm text-ink/65">
                  <Check size={15} className="text-basil" strokeWidth={2.5} />
                  Free shipping on orders above ₹{freeShip}
                </li>
              </ul>

              <p className="mt-6 text-xs text-ink/45">
                Need 10+ hampers?{' '}
                <Link href="/bulk-order" className="text-clay underline underline-offset-4">
                  Get bulk pricing
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
