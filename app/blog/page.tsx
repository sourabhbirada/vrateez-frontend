import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { formatPostDate, getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Vrat Food, Healthy Snacking and Gifting Guides',
  description:
    'Guides from the Vrateez kitchen: what to eat during vrat, how to read snack labels, Diwali and corporate gifting ideas, and millet recipes.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Vrateez Blog',
    description: 'Vrat food, healthy snacking and festive gifting guides from Jaipur.',
    url: `${SITE_URL}/blog`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-parchment">
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #E4A93D 0%, transparent 45%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-12 pb-16 md:pt-16 md:pb-24">
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-3">The Vrateez journal</p>
          <h1 className="font-display italic text-4xl md:text-6xl leading-[1.02]">Eat well, fast well, gift well.</h1>
          <p className="mt-4 max-w-xl text-parchment/65 text-[15px] leading-relaxed">
            Practical guides on vrat food, honest snack labels and festive gifting, written from a millet kitchen in Jaipur.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 md:px-8 -mt-10 md:-mt-14 pb-20">
        {featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 md:grid-cols-[1.1fr_1fr] overflow-hidden rounded-[26px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)]"
            data-reveal
          >
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] bg-ink/5">
              {featured.cover ? (
                <Image src={featured.cover} alt={featured.coverAlt || featured.title} fill priority className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(min-width: 768px) 55vw, 100vw" />
              ) : null}
            </div>
            <div className="p-6 md:p-10 flex flex-col">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">{featured.category || 'Guide'} · Featured</p>
              <h2 className="mt-3 font-display italic text-3xl md:text-4xl text-ink leading-tight group-hover:text-clay transition-colors">{featured.title}</h2>
              <p className="mt-4 text-[15px] text-ink/60 leading-relaxed">{featured.description}</p>
              <div className="mt-auto pt-6 flex items-center justify-between text-xs text-ink/45">
                <span>
                  {formatPostDate(featured.date)} · <Clock size={11} className="inline -mt-0.5" /> {featured.readingMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-clay">
                  Read <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-10 text-center text-ink/60">First articles are on their way.</div>
        )}

        {rest.length ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(36,31,22,0.45)]"
                data-reveal
                data-reveal-delay={String(i * 90)}
              >
                <div className="relative aspect-[16/10] bg-ink/5">
                  {post.cover ? <Image src={post.cover} alt={post.coverAlt || post.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" /> : null}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">{post.category || 'Guide'}</p>
                  <h3 className="mt-2 font-display text-xl text-ink leading-snug group-hover:text-clay transition-colors">{post.title}</h3>
                  <p className="mt-2 text-sm text-ink/55 line-clamp-3">{post.description}</p>
                  <p className="mt-auto pt-4 text-xs text-ink/45">
                    {formatPostDate(post.date)} · {post.readingMinutes} min read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
