'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { useProducts } from '@/context/CatalogContext';
import CountUp from '@/component/common/CountUp';

const POINTS = [
  { title: 'Vrat friendly', body: 'No onion, garlic or grains.' },
  { title: 'Millet first', body: 'Slow energy, no sugar crash.' },
  { title: 'Baked fresh', body: 'Small batches, FSSAI certified.' },
  { title: 'Read the label', body: 'A short list, on purpose.' },
];

/**
 * "Why Vrateez" bento grid (design C2): three stat cards around two product photos,
 * then four short reasons. Ratings come from live product data.
 */
export default function WhyVrateezSection() {
  const { products } = useProducts();

  const { avgRating, totalReviews } = useMemo(() => {
    const rated = products.filter((p) => p.reviews > 0);
    const reviews = rated.reduce((n, p) => n + p.reviews, 0);
    const weighted = reviews ? rated.reduce((n, p) => n + p.rating * p.reviews, 0) / reviews : 0;
    return { avgRating: weighted, totalReviews: reviews };
  }, [products]);

  const statCard = 'flex min-h-[200px] flex-col justify-between rounded-[26px] p-7 md:min-h-[230px]';

  return (
    <section className="bg-cream" id="why-vrateez">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-8" data-reveal>
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-saffron">Why Vrateez</p>
            <h2 className="mt-4 text-balance font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl">
              The snack you don&apos;t have to feel <em className="font-display italic">guilty</em> about.
            </h2>
          </div>
          {totalReviews > 0 ? (
            <div className="text-right">
              <p className="flex items-center justify-end gap-2 font-display text-5xl leading-none text-ink">
                {avgRating.toFixed(1)}
                <Star size={34} className="fill-ink text-ink" aria-hidden="true" />
              </p>
              <p className="mt-2 text-[15px] text-ink/60">{totalReviews}+ verified reviews</p>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-[1fr_1.85fr_1fr] lg:grid-rows-[auto_auto]" data-reveal data-reveal-delay="120">
          {/* Large photo: full width on phones, centre column spanning both rows on desktop. */}
          <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-[26px] lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:aspect-auto">
            <Image
              src="/virteez/Assorted cookie box.jpeg"
              alt="Vrateez millet cookies in gift boxes"
              fill
              className="object-cover object-[50%_40%]"
              sizes="(min-width: 1024px) 45vw, 92vw"
            />
          </div>

          <div className={`${statCard} bg-sage text-ink lg:col-start-1 lg:row-start-1`}>
            <span className="font-display text-6xl leading-none md:text-7xl">
              <CountUp value="10g" />
            </span>
            <span className="max-w-[16rem] text-[15px] leading-snug text-ink/80">protein per serving, from millets, nuts and seeds</span>
          </div>

          <div className={`${statCard} bg-saffron text-white lg:col-start-1 lg:row-start-2`}>
            <span className="font-display text-6xl leading-none md:text-7xl">
              <CountUp value="0g" />
            </span>
            <span className="max-w-[16rem] text-[15px] leading-snug text-white/90">added sugar, sweetened by dates and fruit</span>
          </div>

          <div className="relative hidden aspect-[5/4] overflow-hidden rounded-[26px] lg:col-start-3 lg:row-start-1 lg:block lg:aspect-auto lg:min-h-[230px]">
            <Image
              src="/virteez/Energy bar with packaging.jpeg"
              alt="Vrateez nut and seed energy bar"
              fill
              className="object-cover"
              sizes="22vw"
            />
          </div>

          <div className={`${statCard} col-span-2 bg-ink text-cream lg:col-span-1 lg:col-start-3 lg:row-start-2`}>
            <span className="font-display text-6xl leading-none md:text-7xl">
              <CountUp value="0" />
            </span>
            <span className="max-w-[16rem] text-[15px] leading-snug text-cream/85">palm oil, maida or fillers</span>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/10 pt-8 md:grid-cols-4" data-reveal data-reveal-delay="200">
          {POINTS.map((p) => (
            <li key={p.title}>
              <p className="text-[15px] font-semibold text-ink">{p.title}</p>
              <p className="mt-2 text-[15px] text-ink/60">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
