'use client';

import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';

const ROWS = [
  { label: 'Base', us: 'Millets, nuts & seeds', them: 'Refined flour (maida)' },
  { label: 'Added sugar', us: 'Zero', them: 'Often the first ingredient' },
  { label: 'Oil', us: 'No palm oil', them: 'Palm oil & hydrogenated fats' },
  { label: 'Protein', us: 'High protein, keeps you full', them: 'Empty calories' },
  { label: 'Gluten', us: 'Gluten free', them: 'Wheat based' },
  { label: 'Vrat friendly', us: 'Yes, no onion or garlic', them: 'No' },
];

export default function CompareSection() {
  return (
    <section className="bg-parchment py-16 md:py-20 scroll-mt-24" id="compare">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-3">The honest comparison</p>
          <h2 className="font-display italic text-4xl md:text-5xl text-ink leading-none">Same crunch. None of the junk.</h2>
          <p className="mt-4 text-[15px] text-ink/55">
            Read the back of a regular cookie pack and then read ours. That is the whole pitch.
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] ring-1 ring-ink/[0.08] bg-white shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)]">
          <div className="grid grid-cols-[1.1fr_1.3fr_1.3fr] md:grid-cols-[1fr_1.4fr_1.4fr] text-sm">
            <div className="px-4 md:px-6 py-4 bg-parchment/60 font-label text-[10px] tracking-[0.18em] uppercase text-ink/45 flex items-end">
              What&apos;s inside
            </div>
            <div className="px-4 md:px-6 py-4 bg-basil text-parchment">
              <p className="font-display text-lg leading-none">Vrateez</p>
              <p className="text-[11px] text-parchment/60 mt-1">Clean label snacks</p>
            </div>
            <div className="px-4 md:px-6 py-4 bg-parchment/60">
              <p className="font-display text-lg leading-none text-ink/70">Regular cookies</p>
              <p className="text-[11px] text-ink/40 mt-1">Supermarket shelf</p>
            </div>

            {ROWS.map((row, i) => (
              <div key={row.label} className="contents">
                <div className={`px-4 md:px-6 py-3.5 font-medium text-ink/70 ${i % 2 ? 'bg-parchment/30' : ''}`}>{row.label}</div>
                <div className={`px-4 md:px-6 py-3.5 flex items-start gap-2 text-ink ${i % 2 ? 'bg-basil/[0.06]' : 'bg-basil/[0.03]'}`}>
                  <Check size={15} className="mt-0.5 shrink-0 text-basil" strokeWidth={2.5} />
                  <span className="font-medium">{row.us}</span>
                </div>
                <div className={`px-4 md:px-6 py-3.5 flex items-start gap-2 text-ink/55 ${i % 2 ? 'bg-parchment/30' : ''}`}>
                  <X size={15} className="mt-0.5 shrink-0 text-clay/70" strokeWidth={2.5} />
                  <span>{row.them}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop?category=cookies"
            className="group inline-flex items-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
          >
            Try the cookies
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
