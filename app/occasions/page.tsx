import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift, Moon } from 'lucide-react';
import { isOngoing, upcomingOccasions } from '@/lib/occasions';
import { SITE_URL } from '@/lib/site';

// Recheck dates hourly so finished occasions drop off without a deploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Upcoming Fasts and Festivals: Ekadashi, Chhath and Gifting',
  description:
    'Dates for the next vrat days and festivals, from Chhath Puja and Dev Uthani Ekadashi to wedding season and year-end gifting, with snacks and hampers for each.',
  alternates: { canonical: `${SITE_URL}/occasions` },
  openGraph: {
    title: 'Upcoming Fasts and Festivals | Vrateez',
    description: 'Vrat days and festivals coming up, with vrat-friendly snacks and gifting for each.',
    url: `${SITE_URL}/occasions`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
};

export default function OccasionsPage() {
  const occasions = upcomingOccasions();

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Fasts and festivals', item: `${SITE_URL}/occasions` },
    ],
  };

  return (
    <main className="min-h-screen bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="bg-butter">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink/50">
            <Link href="/" className="transition hover:text-ink">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink/75">Fasts and festivals</span>
          </nav>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-rust">Coming up</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl">
            Upcoming fasts and festivals
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/70">
            The next vrat days and gifting occasions, with what to keep in the kitchen for each. Orders are packed in 24 to 48 hours
            and reach most of India in 3 to 5 business days, so order a few days ahead.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-ink/55">
            Dates are for India and follow Drik Panchang. Ekadashi and Chhath dates can differ by a day in your city or tradition, so
            check your local panchang.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        {occasions.length ? (
          <ol className="grid gap-6">
            {occasions.map((o) => {
              const now = isOngoing(o);
              return (
                <li
                  key={o.id}
                  id={o.id}
                  className="grid min-w-0 overflow-hidden rounded-[26px] bg-white ring-1 ring-ink/[0.06] md:grid-cols-[280px_1fr]"
                >
                  <div className="relative aspect-[16/10] bg-peach md:aspect-auto md:min-h-[220px]">
                    <Image src={o.image} alt="" fill sizes="(min-width: 768px) 280px, 92vw" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-col p-6 md:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cream px-3 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-ink/[0.08]">
                        {o.dateLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                          o.kind === 'fast' ? 'bg-sage text-basil' : 'bg-peach text-rust'
                        }`}
                      >
                        {o.kind === 'fast' ? <Moon size={11} /> : <Gift size={11} />}
                        {o.kind === 'fast' ? 'Fast' : 'Gifting'}
                      </span>
                      {now ? (
                        <span className="rounded-full bg-rust px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                          On now
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-ink md:text-[1.7rem]">{o.name}</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{o.detail}</p>
                    <Link
                      href={o.cta.href}
                      className="pressable group mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white transition hover:bg-clay"
                    >
                      {o.cta.label}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="rounded-[26px] bg-white p-10 text-center ring-1 ring-ink/[0.06]">
            <p className="font-display text-2xl text-ink">New dates coming soon.</p>
            <p className="mt-2 text-sm text-ink/60">Meanwhile, our vrat snacks are always in stock.</p>
            <Link href="/shop" className="mt-5 inline-flex rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white">
              Shop all snacks
            </Link>
          </div>
        )}

        <div className="mt-12 rounded-[26px] bg-sage/60 p-7 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Gifting for a team or a wedding?</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/70">
            We pack custom hampers with your choice of cookies, energy bars and makhana, with branded packaging and a printed note.
          </p>
          <Link
            href="/bulk-order"
            className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-basil underline decoration-basil/30 underline-offset-[6px]"
          >
            Get a bulk quote <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}
