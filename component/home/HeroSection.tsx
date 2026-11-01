'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRight, Leaf, ShieldCheck, Star, WheatOff } from 'lucide-react';
import { useCatalog, useProducts } from '@/context/CatalogContext';
import type { Banner } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';

type HeroSlide = {
    image: string;
    video?: string;
    imagePosition: string;
    tag: string;
    title: string;
    subtitle: string;
    cta: string;
    href: string;
    macros: Array<{ value: string; label: string }>;
};

const FALLBACK_SLIDES: HeroSlide[] = [
    {
        image: '/diwali-hero.jpg',
        imagePosition: 'object-cover object-center',
        tag: 'Diwali Special · Limited Time',
        title: 'Gift hamper that\nlights up Diwali.',
        subtitle: 'Healthy treats, decorative diyas and a festive greeting card, all wrapped in warmth.',
        cta: 'Order hamper now',
        href: '/diwali',
        macros: [
            { value: '₹379', label: 'Special Price' },
            { value: '₹120', label: 'You Save' },
            { value: '6', label: 'Items' },
        ],
    },
    {
        image: '/virteez/All three infused cookies.jpeg',
        imagePosition: 'object-[70%_38%]',
        tag: 'High Protein · Vrat Friendly',
        title: 'Protein that\nfits your fast.',
        subtitle: 'Millet-based protein cookies built for real training days. Clean label, no compromise.',
        cta: 'Shop protein cookies',
        href: '/shop?category=cookies',
        macros: [
            { value: '10g', label: 'Protein' },
            { value: '0g', label: 'Added Sugar' },
            { value: '140', label: 'Calories' },
        ],
    },
    {
        image: '/virteez/Energy bar with packaging.jpeg',
        imagePosition: 'object-cover object-center',
        tag: 'Energy on the Go',
        title: 'Fuel for\nthe long fast.',
        subtitle: 'Nut and seed energy bars with slow-release carbs. Steady energy through vrat, workouts and travel.',
        cta: 'Shop energy bars',
        href: '/shop?category=energy-on-the-go',
        macros: [
            { value: '8g', label: 'Protein' },
            { value: '0g', label: 'Added Sugar' },
            { value: '100%', label: 'Natural' },
        ],
    },
    {
        image: '/virteez/Assorted cookie box.jpeg',
        imagePosition: 'object-cover object-center',
        tag: 'Corporate & Festive Gifting',
        title: 'Gifts that nourish,\nnot just please.',
        subtitle: 'Custom hampers for teams, clients and family. Vrat friendly, zero added sugar, delivered pan-India.',
        cta: 'Plan a bulk order',
        href: '/bulk-order',
        macros: [
            { value: 'Custom', label: 'Packaging' },
            { value: 'Pan-India', label: 'Delivery' },
            { value: '30-day', label: 'Terms' },
        ],
    },
];

const FEATURES = [
    { icon: Leaf, label: 'No onion, no garlic' },
    { icon: WheatOff, label: 'Gluten free' },
    { icon: ShieldCheck, label: 'FSSAI certified' },
];

/** Small round photo that overlaps the hero card (design F1). */
const INSET_IMAGE = '/virteez/Energy bar with packaging.jpeg';

function mapBannerToSlide(banner: Banner): HeroSlide {
    const macros =
        banner.macros && banner.macros.length > 0
            ? banner.macros
            : [
                  { value: 'Clean', label: 'Label' },
                  { value: 'Vrat', label: 'Friendly' },
                  { value: 'GF', label: 'Gluten Free' },
              ];

    return {
        image: banner.image || '',
        video: banner.video || undefined,
        imagePosition: 'object-cover object-center',
        tag: banner.tag || 'Vrateez Special',
        title: banner.title,
        subtitle: banner.subtitle,
        cta: banner.cta || 'Shop Now',
        href: banner.ctaLink || '/shop',
        macros,
    };
}

function slidesFromBanners(banners: Banner[] | null | undefined): HeroSlide[] {
    const mapped = (banners || []).map(mapBannerToSlide).filter((s) => s.title && (s.image || s.video));
    return mapped.length > 0 ? mapped : FALLBACK_SLIDES;
}

/**
 * Two-line titles get the highlighter stroke from the design on the second line,
 * except its last word: "Gift hamper that / [lights up] Diwali."
 */
function TitleWithHighlight({ title }: { title: string }) {
    const lines = title
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    if (lines.length < 2) return <>{title}</>;
    const [first, ...rest] = lines;
    const words = rest.join(' ').split(/\s+/);
    const lead = words.length > 1 ? words.slice(0, -1).join(' ') : words.join(' ');
    const last = words.length > 1 ? words[words.length - 1] : '';
    return (
        <>
            {first}
            <br />
            <span className="-mx-1 box-decoration-clone bg-[linear-gradient(transparent_60%,rgba(255,196,128,0.8)_60%,rgba(255,196,128,0.8)_90%,transparent_90%)] px-1">
                {lead}
            </span>
            {last ? <> {last}</> : null}
        </>
    );
}

/** Price or stat card: the first value large, the rest as chips. "You Save ₹120" reads as "Save ₹120". */
function MacroCard({ macros }: { macros: HeroSlide['macros'] }) {
    if (!macros.length) return null;
    const [lead, ...rest] = macros;
    const leadIsPrice = lead.value.trim().startsWith('₹');
    return (
        <div className="inline-flex max-w-full flex-wrap items-center gap-x-5 gap-y-3 rounded-[22px] bg-white px-6 py-4 shadow-[0_18px_40px_-24px_rgba(36,31,22,0.35)] ring-1 ring-ink/[0.06]">
            <span className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold leading-none text-ink md:text-[2.6rem]">{lead.value}</span>
                {leadIsPrice ? null : <span className="text-sm text-ink/55">{lead.label.toLowerCase()}</span>}
            </span>
            {rest.map((m, i) =>
                /save/i.test(m.label) ? (
                    <span key={`${m.label}-${i}`} className="rounded-full bg-sage px-3 py-1.5 text-sm font-semibold text-basil">
                        Save {m.value}
                    </span>
                ) : (
                    <span key={`${m.label}-${i}`} className="text-sm font-medium text-ink/65">
                        {m.value} {m.label.toLowerCase()}
                        {/^items?$/i.test(m.label) ? ' inside' : ''}
                    </span>
                ),
            )}
        </div>
    );
}

export default function HeroSection() {
    // Banners come from the server-rendered catalogue, so the first slide is in the HTML
    // and the hero never swaps from a placeholder to content (no layout shift).
    const { banners } = useCatalog();
    const { products } = useProducts();
    const slides = useMemo(() => slidesFromBanners(banners), [banners]);
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const { avgRating, totalReviews } = useMemo(() => {
        const rated = products.filter((p) => p.reviews > 0);
        const reviews = rated.reduce((n, p) => n + p.reviews, 0);
        const avg = reviews ? rated.reduce((n, p) => n + p.rating * p.reviews, 0) / reviews : 0;
        return { avgRating: avg, totalReviews: reviews };
    }, [products]);

    const goTo = useCallback(
        (idx: number) => {
            if (isAnimating || slides.length === 0) return;
            setIsAnimating(true);
            setTimeout(() => {
                setCurrent(idx);
                setTimeout(() => setIsAnimating(false), 50);
            }, 350);
        },
        [isAnimating, slides.length],
    );

    const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next, slides.length]);

    if (!slides.length) return null;

    const slide = slides[current];
    const contentAnim = isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0';

    return (
        <section className="relative overflow-hidden bg-cream">
            {/* Soft peach and sage washes from the design: plain gradients, no blur filters. */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(60% 70% at 85% 10%, rgba(252,222,200,0.75) 0%, transparent 70%), radial-gradient(45% 55% at 0% 100%, rgba(214,228,205,0.7) 0%, transparent 70%)',
                }}
            />

            <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-2 lg:gap-14">
                {/* Copy */}
                <div className={`min-w-0 transition-all duration-500 ease-out ${contentAnim}`}>
                    <span className="inline-block rounded-full bg-peach px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/80">
                        {slide.tag}
                    </span>
                    {/* Slide titles rotate, so they are h2s; the page's single h1 is in HomePageClient. */}
                    <h2 className="mt-6 text-balance font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl lg:text-[4.1rem]">
                        <TitleWithHighlight title={slide.title} />
                    </h2>
                    <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/60">{slide.subtitle}</p>

                    <div className="mt-7">
                        <MacroCard macros={slide.macros} />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <Link
                            href={slide.href}
                            className="pressable group inline-flex items-center gap-2.5 rounded-full bg-rust px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(185,68,31,0.6)] transition hover:bg-clay"
                        >
                            {slide.cta}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/shop"
                            className="text-[15px] font-semibold text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink"
                        >
                            View all products
                        </Link>
                    </div>

                    <ul className="mt-8 flex flex-wrap gap-2.5">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <li
                                key={label}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink/80 ring-1 ring-ink/[0.07]"
                            >
                                <Icon size={14} className="text-basil" />
                                {label}
                            </li>
                        ))}
                    </ul>

                    {slides.length > 1 ? (
                        <div className="mt-6 flex gap-1">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => goTo(i)}
                                    className="group flex h-6 items-center px-1"
                                    aria-label={`Show slide ${i + 1}`}
                                    aria-current={i === current}
                                >
                                    <span
                                        className={`block h-1.5 rounded-full transition-all duration-300 ${
                                            i === current ? 'w-8 bg-rust' : 'w-1.5 bg-ink/15 group-hover:bg-ink/30'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Photo card */}
                <div className="relative mx-auto w-full max-w-[540px] lg:mr-0">
                    <div className="relative aspect-[15/16] overflow-hidden rounded-[34px] bg-[#5a2a17] shadow-[0_40px_80px_-36px_rgba(90,42,23,0.6)]">
                        {/* Every slide image stays mounted and cross-fades, so a new slide never starts as an
                            unloaded image. The first slide is the LCP image (high priority); the rest load at low priority. */}
                        {slides.map((s, i) => {
                            const visible = i === current && !isAnimating;
                            return (
                                <div
                                    key={`${s.image}-${s.video ?? ''}-${i}`}
                                    className={`absolute inset-0 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
                                    aria-hidden={i !== current}
                                >
                                    {s.video && i === current ? (
                                        <video
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            poster={resolveImage(s.image || undefined)}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        >
                                            <source src={s.video} type="video/mp4" />
                                        </video>
                                    ) : s.image ? (
                                        <Image
                                            src={resolveImage(s.image)}
                                            alt={i === current ? s.title.replace(/\s+/g, ' ') : ''}
                                            fill
                                            className={`object-cover ${s.imagePosition}`}
                                            priority={i === 0}
                                            fetchPriority={i === 0 ? 'high' : 'low'}
                                            loading={i === 0 ? undefined : 'eager'}
                                            sizes="(min-width: 1024px) 540px, 92vw"
                                        />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>

                    {totalReviews > 0 ? (
                        <div className="absolute -left-2 top-6 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(36,31,22,0.45)] ring-1 ring-ink/[0.05] sm:-left-10 sm:top-12">
                            <div className="flex gap-0.5 text-millet" aria-hidden="true">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={13} className={i < Math.round(avgRating) ? 'fill-millet' : 'fill-transparent'} />
                                ))}
                            </div>
                            <p className="mt-1 text-sm text-ink/60">
                                <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span> {totalReviews}+ verified reviews
                            </p>
                        </div>
                    ) : null}

                    <div className="absolute -bottom-7 -left-2 h-28 w-28 overflow-hidden rounded-full bg-white shadow-[0_20px_40px_-18px_rgba(36,31,22,0.5)] ring-[6px] ring-white sm:-left-10 sm:h-40 sm:w-40">
                        <Image src={INSET_IMAGE} alt="Vrateez energy bar" fill className="object-cover" sizes="160px" />
                    </div>
                </div>
            </div>
        </section>
    );
}
