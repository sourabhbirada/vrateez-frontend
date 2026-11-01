'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, Flame, ShieldCheck, Sprout, Star, Truck, Wheat } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useProducts } from '@/context/CatalogContext';
import CountUp from '@/component/common/CountUp';

const PROOF = [
  { value: '10g', label: 'protein per serving', sub: 'From millets, nuts and seeds. No powders.' },
  { value: '0g', label: 'added sugar', sub: 'Sweetened by dates and fruit only.' },
  { value: '0', label: 'palm oil, maida or fillers', sub: 'The ingredient list is short on purpose.' },
];

const REASONS = [
  {
    icon: Sprout,
    title: 'Vrat friendly, everyday friendly',
    body: 'No onion, no garlic, no grains. Safe for Navratri and Ekadashi, and for the Monday you just want to eat clean.',
  },
  {
    icon: Wheat,
    title: 'Millet first, not maida',
    body: 'Slow-release energy that keeps you full till the next meal instead of a sugar crash twenty minutes later.',
  },
  {
    icon: Flame,
    title: 'Baked fresh in small batches',
    body: 'Packed to order in our FSSAI-certified kitchen in Jaipur and shipped within 24 to 48 hours.',
  },
  {
    icon: ShieldCheck,
    title: 'Recommended by people who read labels',
    body: 'Nutritionists, fitness coaches and gym owners stock us because the label is the pitch.',
  },
];

export default function WhyVrateezSection() {
  const { settings } = useSettings();
  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const { products } = useProducts();

  const { avgRating, totalReviews } = useMemo(() => {
    const eligible = products.filter((p) => p.isActive !== false && p.category !== 'testing' && p.reviews > 0);
    const reviews = eligible.reduce((n, p) => n + p.reviews, 0);
    const weighted = reviews ? eligible.reduce((n, p) => n + p.rating * p.reviews, 0) / reviews : 0;
    return { avgRating: weighted, totalReviews: reviews };
  }, [products]);

  return (
    <section className="relative overflow-hidden bg-parchment" id="why-vrateez">
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.04] mix-blend-multiply" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-40"
        aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(228,169,61,0.55) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div data-reveal>
            <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-4">Why Vrateez</p>
            <h2 className="font-display italic text-4xl md:text-[3.4rem] leading-[1.02] tracking-[-0.015em] text-ink">
              The snack you don&apos;t have to feel guilty about.
              <span className="block not-italic font-sans text-lg md:text-xl font-normal text-ink/55 mt-4 tracking-normal leading-relaxed max-w-xl">
                Most &ldquo;healthy&rdquo; cookies are maida, sugar and palm oil with a leaf on the box. Ours are millets, nuts and
                seeds, baked fresh, vrat friendly, and good enough that you will reorder before the box is empty.
              </span>
            </h2>

            <dl className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
              {PROOF.map((p) => (
                <div key={p.label} className="rounded-2xl bg-ink text-parchment px-4 py-4 md:px-5 md:py-5 ring-1 ring-ink/10">
                  <dt className="font-display text-3xl md:text-4xl text-millet leading-none"><CountUp value={p.value} /></dt>
                  <dd className="mt-1.5 text-[12px] md:text-[13px] font-semibold leading-snug">{p.label}</dd>
                  <dd className="mt-1 hidden md:block text-[11px] text-parchment/50 leading-snug">{p.sub}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {REASONS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-basil text-parchment">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink leading-snug">{title}</p>
                    <p className="mt-1 text-sm text-ink/55 leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="group pressable inline-flex items-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
              >
                Shop bestsellers
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#compare" className="text-sm font-semibold text-ink/60 hover:text-ink underline decoration-ink/20 underline-offset-4 transition">
                See the label comparison
              </a>
            </div>
          </div>

          {/* Collage */}
          <div className="relative mx-auto w-full max-w-[520px] aspect-[4/5] lg:aspect-[5/6]" data-reveal data-reveal-delay="160">
            <div className="absolute inset-x-6 top-0 bottom-16 rounded-[32px] overflow-hidden ring-1 ring-ink/10 shadow-[0_40px_90px_-40px_rgba(36,31,22,0.6)]">
              <Image
                src="/virteez/All three infused cookies.jpeg"
                alt="Vrateez infused cookies"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent" />
              <div className="absolute left-5 bottom-5 right-5 text-parchment">
                <p className="font-display italic text-2xl leading-tight">Infused cookies</p>
                <p className="text-xs text-parchment/70 mt-1">Blueberry · Cranberry · zero added sugar</p>
              </div>
            </div>

            <div className="absolute -left-2 md:-left-6 bottom-6 w-[46%] aspect-[4/3] rounded-3xl overflow-hidden ring-4 ring-parchment shadow-2xl rotate-[-4deg]">
              <Image src="/virteez/Energy bar with packaging.jpeg" alt="Vrateez energy bar" fill className="object-cover" sizes="240px" />
            </div>
            <div className="absolute -right-2 md:-right-6 bottom-0 w-[42%] aspect-square rounded-3xl overflow-hidden ring-4 ring-parchment shadow-2xl rotate-[5deg]">
              <Image src="/virteez/Cashew cookies in plate along with box.jpeg" alt="Vrateez cashew cookies" fill className="object-cover" sizes="220px" />
            </div>

            {totalReviews > 0 ? (
              <div className="absolute top-5 -left-1 md:-left-6 rounded-2xl bg-parchment px-4 py-3 shadow-xl ring-1 ring-ink/10 animate-float">
                <div className="flex items-center gap-1 text-millet">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < Math.round(avgRating) ? 'fill-millet' : 'fill-transparent'} />
                  ))}
                  <span className="ml-1 font-display text-lg text-ink leading-none">{avgRating.toFixed(1)}</span>
                </div>
                <p className="text-[11px] text-ink/55 mt-1">{totalReviews}+ verified reviews</p>
              </div>
            ) : null}

            <div className="absolute top-24 -right-1 md:-right-8 rounded-full bg-basil text-parchment px-4 py-2 text-xs font-semibold shadow-xl inline-flex items-center gap-2">
              <Truck size={14} className="text-millet" /> Free delivery above ₹{threshold}
            </div>
            <div className="absolute top-40 -right-1 md:-right-4 rounded-full bg-parchment text-ink px-4 py-2 text-xs font-semibold shadow-xl ring-1 ring-ink/10 inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-basil" /> FSSAI certified
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
