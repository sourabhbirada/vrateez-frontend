import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Gift, MessageCircle, Share2 } from 'lucide-react';
import { formatPostDate, getAllPosts, getPostBySlug } from '@/lib/blog';
import { faqPageSchema } from '@/lib/seoFaqs';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Article not found', robots: { index: false } };
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.cover ? absoluteUrl(post.cover) : DEFAULT_OG_IMAGE;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      images: [{ url: image, width: 1600, height: 900, alt: post.coverAlt || post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.cover ? absoluteUrl(post.cover) : DEFAULT_OG_IMAGE;
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 3);
  const shareText = encodeURIComponent(`${post.title} ${url}`);

  const schema: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: [image],
      datePublished: post.date,
      dateModified: post.updated || post.date,
      author: { '@type': 'Organization', name: post.author, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
      mainEntityOfPage: url,
      keywords: post.keywords.join(', '),
      wordCount: Math.round(post.readingMinutes * 220),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faq.length) schema.push(faqPageSchema(post.faq.map((f) => ({ question: f.q, answer: f.a }))));

  return (
    <main className="min-h-screen bg-parchment">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden bg-ink text-parchment">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(ellipse at 85% 15%, #E4A93D 0%, transparent 45%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 md:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <nav aria-label="Breadcrumb" className="text-xs text-parchment/50 mb-5">
            <Link href="/" className="hover:text-parchment">Home</Link> <span className="mx-1.5">/</span>
            <Link href="/blog" className="hover:text-parchment">Blog</Link>
            {post.category ? (
              <>
                <span className="mx-1.5">/</span>
                <span className="text-parchment/70">{post.category}</span>
              </>
            ) : null}
          </nav>
          <h1 className="font-display italic text-3xl md:text-5xl leading-[1.08]">{post.title}</h1>
          <p className="mt-4 text-parchment/65 text-[15px] md:text-base leading-relaxed max-w-2xl">{post.description}</p>
          <p className="mt-5 text-xs text-parchment/50">
            By {post.author} · {formatPostDate(post.date)}
            {post.updated && post.updated !== post.date ? ` · Updated ${formatPostDate(post.updated)}` : ''} ·{' '}
            <Clock size={11} className="inline -mt-0.5" /> {post.readingMinutes} min read
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 md:px-8 -mt-10 md:-mt-14 pb-20">
        {post.cover ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[26px] ring-1 ring-ink/10 shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)] bg-ink/5">
            <Image src={post.cover} alt={post.coverAlt || post.title} fill priority className="object-cover" sizes="(min-width: 1152px) 1152px, 100vw" />
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 items-start">
          <article className="prose-brand" dangerouslySetInnerHTML={{ __html: post.html }} />

          <aside className="space-y-6 lg:sticky lg:top-28">
            {post.toc.length > 2 ? (
              <nav aria-label="On this page" className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-3">On this page</p>
                <ol className="space-y-1.5 text-sm">
                  {post.toc
                    .filter((t) => t.depth === 2)
                    .map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="text-ink/65 hover:text-ink transition">
                          {t.text}
                        </a>
                      </li>
                    ))}
                </ol>
              </nav>
            ) : null}

            <div className="rounded-[22px] bg-ink text-parchment p-6">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-2">Diwali special</p>
              <p className="font-display italic text-2xl leading-tight">Gift health, not sugar.</p>
              <p className="mt-2 text-sm text-parchment/65">Energy bars, millet cookies, diyas and a card in a festive box for ₹379.</p>
              <Link href="/diwali" className="mt-4 inline-flex items-center gap-2 rounded-full bg-turmeric px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-clay transition pressable">
                <Gift size={15} /> See the hamper <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-6">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-2">Ordering for a team?</p>
              <p className="text-sm text-ink/65 leading-relaxed">Branded cards, home delivery per employee and volume pricing from 20 boxes.</p>
              <Link href="/bulk-order" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clay hover:text-ink transition">
                Get bulk pricing <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-3 inline-flex items-center gap-1.5">
                <Share2 size={12} /> Share
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366]/15 px-3.5 py-2 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/25 inline-flex items-center gap-1.5">
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="rounded-full ring-1 ring-ink/15 px-3.5 py-2 text-xs font-semibold text-ink hover:bg-ink/5">
                  LinkedIn
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="rounded-full ring-1 ring-ink/15 px-3.5 py-2 text-xs font-semibold text-ink hover:bg-ink/5">
                  X
                </a>
              </div>
            </div>
          </aside>
        </div>

        {post.faq.length ? (
          <section className="mt-14 max-w-3xl">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-3">Questions people ask</p>
            <ul className="divide-y divide-ink/[0.08] rounded-[22px] bg-white ring-1 ring-ink/[0.08]">
              {post.faq.map((f) => (
                <li key={f.q} className="px-5 md:px-6 py-4">
                  <p className="font-semibold text-ink text-[15px]">{f.q}</p>
                  <p className="mt-1.5 text-sm text-ink/60 leading-relaxed">{f.a}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14 relative overflow-hidden rounded-[26px] bg-ink text-parchment px-6 md:px-10 py-10 md:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 30%, #E4A93D 0%, transparent 40%)' }} />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-2">Ready to order</p>
              <h2 className="font-display italic text-3xl md:text-4xl leading-tight">Hampers that people actually finish.</h2>
              <p className="mt-2 text-parchment/65 text-sm max-w-md">Zero added sugar, vrat friendly, FSSAI certified. Free delivery above ₹499, cash on delivery available.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/diwali" className="inline-flex items-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment hover:bg-clay transition pressable">
                Diwali hamper <ArrowRight size={15} />
              </Link>
              <Link href="/bulk-order" className="inline-flex items-center gap-2 rounded-full bg-parchment/10 ring-1 ring-parchment/20 px-6 py-3.5 text-sm font-semibold text-parchment hover:bg-parchment/20 transition">
                Bulk order
              </Link>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="mt-14">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-4">Keep reading</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 transition hover:-translate-y-1">
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">{p.category || 'Guide'}</p>
                  <h3 className="mt-2 font-display text-xl text-ink leading-snug group-hover:text-clay transition-colors">{p.title}</h3>
                  <p className="mt-3 text-xs text-ink/45">{p.readingMinutes} min read</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
