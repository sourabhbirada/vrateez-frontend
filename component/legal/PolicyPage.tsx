import Link from 'next/link';
import type { ReactNode } from 'react';

export type PolicySection = { heading: string; body: ReactNode };

/**
 * Shared layout for the policy and contact pages. Server-rendered, so every word is in the HTML.
 */
export default function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updated?: string;
  sections: PolicySection[];
  aside?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-parchment">
      <section className="bg-ink text-parchment">
        <div className="mx-auto max-w-4xl px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-parchment/50">
            <Link href="/" className="transition hover:text-parchment">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-parchment/75">{title}</span>
          </nav>
          <p className="mb-3 font-label text-[10px] uppercase tracking-[0.24em] text-millet/80">{eyebrow}</p>
          <h1 className="font-display text-4xl italic leading-[1.05] md:text-5xl">{title}</h1>
          <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-parchment/70">{intro}</div>
          {updated ? <p className="mt-5 text-xs text-parchment/45">Last updated {updated}</p> : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-10 px-5 py-12 md:px-8 md:py-16">
        {aside}
        {sections.map((s) => (
          <section key={s.heading} className="grid gap-3">
            <h2 className="font-display text-2xl italic text-ink">{s.heading}</h2>
            <div className="grid gap-3 text-[15px] leading-relaxed text-ink/75 [&_a]:font-semibold [&_a]:text-clay [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
