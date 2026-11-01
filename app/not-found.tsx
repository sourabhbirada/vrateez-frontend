import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};
import { ArrowRight, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[85vh] items-center overflow-hidden bg-parchment">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-40"
        aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(228,169,61,0.55) 0%, transparent 65%)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display italic text-[12rem] leading-none text-ink/[0.05] md:text-[22rem]"
      >
        404
      </span>

      <div className="relative mx-auto w-full max-w-3xl px-5 py-20 text-center md:px-8 md:py-28" data-reveal>
        <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay">Page not found</p>
        <h1 className="mt-4 font-display italic text-4xl leading-[1.02] text-ink md:text-6xl">
          This page has gone stale.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink/55">
          The link may be old or mistyped. The cookies, thankfully, are still fresh.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="pressable group inline-flex w-full items-center justify-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay sm:w-auto"
          >
            <ShoppingBag size={16} />
            Shop the range
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/track-order"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5 sm:w-auto"
          >
            <Search size={15} />
            Track an order
          </Link>
        </div>

        <p className="mt-10 text-xs text-ink/45">
          Or head to the{' '}
          <Link href="/" className="text-clay underline underline-offset-4">
            home page
          </Link>
          {' · '}
          <Link href="/faq" className="text-clay underline underline-offset-4">
            FAQ
          </Link>
          {' · '}
          <Link href="/bulk-order" className="text-clay underline underline-offset-4">
            Bulk orders
          </Link>
        </p>
      </div>
    </main>
  );
}
