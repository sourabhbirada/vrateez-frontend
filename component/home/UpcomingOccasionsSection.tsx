import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Gift, Moon } from 'lucide-react';
import type { Occasion } from '@/lib/occasions';

/**
 * "Coming up" strip on the homepage: the next few fasts and festivals from lib/occasions.ts,
 * each with what to buy for it. Replaces the Diwali hamper offer after Diwali 2026.
 */
export default function UpcomingOccasionsSection({ occasions }: { occasions: Occasion[] }) {
  if (!occasions.length) return null;
  const shown = occasions.slice(0, 4);

  return (
    <section className="bg-butter" id="upcoming">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-rust">
              <CalendarDays size={14} />
              Coming up
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[3.2rem]">
              Fasts and festivals ahead
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink/70">
              Plan your vrat snacks and gifts before the day. Orders are packed in 24 to 48 hours and reach you in 3 to 5 business days.
            </p>
          </div>
          <Link
            href="/occasions"
            className="text-[15px] font-semibold text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink"
          >
            See all dates
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-reveal data-reveal-delay="120">
          {shown.map((o) => (
            <li key={o.id} className="flex min-w-0 flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-ink/[0.06]">
              <div className="relative aspect-[4/3] bg-peach">
                <Image src={o.image} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-ink shadow-sm">
                  {o.dateLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                    o.kind === 'fast' ? 'bg-sage text-basil' : 'bg-peach text-rust'
                  }`}
                >
                  {o.kind === 'fast' ? <Moon size={11} /> : <Gift size={11} />}
                  {o.kind === 'fast' ? 'Fast' : 'Gifting'}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink">{o.name}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink/65">{o.blurb}</p>
                <Link
                  href={o.cta.href}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-rust transition hover:text-clay"
                >
                  {o.cta.label}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
