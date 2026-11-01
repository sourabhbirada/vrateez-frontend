'use client';

import { ArrowRight, Check, Gift, Package, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCatalog, useProducts } from '@/context/CatalogContext';
import type { Deal, Product } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';

const FALLBACK_DEAL: Deal = {
    _id: 'fallback-diwali',
    title: 'Diwali Gift Hamper',
    subtitle: 'Celebrate the festival of lights with a healthy gift!',
    description:
        'To health and happiness, Vrateez brings you the warmth of Diwali wrapped in delicious treats. Each hamper includes energy bars, cookies, millet bites, decorative diyas & a festive greeting card.',
    badge: 'LIMITED TIME OFFER',
    cta: 'Order Now',
    ctaLink: '/diwali',
    image: '/diwali-hamper.png',
    video: '',
    price: 379,
    originalPrice: 499,
    items: [
        'Energy Bar',
        'Coconut Cookies',
        'Dry Fruit Cookies',
        'Millet Bites',
        'Decorative Diyas',
        'Festive Greeting Card',
    ],
    productSlug: 'diwali-gift-hamper',
    placement: 'homepage',
    bgFrom: '#FFF5E6',
    bgTo: '#FFE8CC',
    isActive: true,
    position: 1,
};

const TRUST = [
    { icon: Package, label: 'Premium gift box' },
    { icon: Truck, label: 'Pan-India delivery' },
    { icon: ShieldCheck, label: 'Clean label · FSSAI' },
];

const MARQUEE = ['Diwali Special', 'Save ₹120', 'Free delivery above ₹499', 'Limited stock', 'Vrat friendly', 'Zero added sugar'];

function MarqueeStrip() {
    const items = [...MARQUEE, ...MARQUEE];
    return (
        <div className="relative overflow-hidden bg-millet text-ink border-y border-ink/10">
            <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
                {items.map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center gap-4 px-5 font-label text-[11px] tracking-[0.22em] uppercase">
                        <Sparkles size={11} className="shrink-0" />
                        {t}
                    </span>
                ))}
            </div>
        </div>
    );
}

function DealCard({ deal }: { deal: Deal }) {
    const { addToCart, toggleCart } = useCart();
    const { products } = useProducts();
    const slug = deal.productSlug?.trim();
    const product: Product | null = (slug && products.find((p) => p.slug === slug)) || null;
    const [adding, setAdding] = useState(false);

    const detailsHref = deal.ctaLink && deal.ctaLink.startsWith('/') && !deal.ctaLink.startsWith('/product/') ? deal.ctaLink : '/diwali';
    const productHref = deal.productSlug?.trim() ? `/product/${deal.productSlug.trim()}` : detailsHref;
    const price = product?.price ?? deal.price;
    const originalPrice = product?.originalPrice ?? deal.originalPrice;
    const savings = originalPrice > price && price > 0 ? originalPrice - price : 0;
    const pct = savings ? Math.round((savings / originalPrice) * 100) : 0;

    const handleAdd = () => {
        if (!product) return;
        setAdding(true);
        addToCart({
            id: product._id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            weight: product.weight,
            freeDelivery: product.freeDelivery,
        });
        toggleCart();
        window.setTimeout(() => setAdding(false), 1200);
    };

    return (
        <section className="relative overflow-hidden bg-ink text-parchment">
            <MarqueeStrip />

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.10]"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse at 18% 25%, #E4A93D 0%, transparent 42%), radial-gradient(ellipse at 88% 75%, #C4711F 0%, transparent 38%)',
                }}
            />
            <div className="pointer-events-none absolute inset-0 grain-overlay opacity-[0.05] mix-blend-overlay" aria-hidden="true" />

            <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
                    {/* Media */}
                    <div className="relative" data-reveal>
                        <div className="absolute -inset-3 md:-inset-4 rounded-[28px] border border-millet/20" aria-hidden="true" />
                        <div className="absolute -inset-6 md:-inset-8 rounded-[36px] border border-millet/10" aria-hidden="true" />

                        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] ring-1 ring-parchment/15 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
                            {deal.video ? (
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    poster={resolveImage(deal.image || undefined)}
                                    className="absolute inset-0 h-full w-full object-cover"
                                >
                                    <source src={deal.video} type="video/mp4" />
                                </video>
                            ) : deal.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resolveImage(deal.image)} alt={deal.title} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-basil" />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />

                            {deal.badge ? (
                                <span className="absolute top-4 left-4 inline-flex items-center gap-2 bg-ink/70 backdrop-blur-md text-millet font-label text-[10px] tracking-[0.22em] uppercase px-3 py-1.5 rounded-full ring-1 ring-millet/30">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-millet opacity-70" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-millet" />
                                    </span>
                                    {deal.badge}
                                </span>
                            ) : null}

                            {deal.items?.length ? (
                                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                                    {deal.items.slice(0, 4).map((item) => (
                                        <span key={item} className="bg-parchment/15 backdrop-blur-md text-parchment text-[11px] font-medium px-2.5 py-1 rounded-full ring-1 ring-parchment/20">
                                            {item}
                                        </span>
                                    ))}
                                    {deal.items.length > 4 ? (
                                        <span className="bg-parchment/15 backdrop-blur-md text-parchment/80 text-[11px] px-2.5 py-1 rounded-full ring-1 ring-parchment/20">
                                            +{deal.items.length - 4} more
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        {price > 0 ? (
                            <div className="absolute -bottom-6 -right-2 md:-right-6 bg-parchment text-ink rounded-2xl px-5 py-4 shadow-2xl ring-1 ring-ink/10 animate-glow">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-display text-3xl md:text-4xl leading-none">₹{price}</span>
                                    {originalPrice > price ? <span className="text-sm text-ink/40 line-through">₹{originalPrice}</span> : null}
                                </div>
                                {savings > 0 ? (
                                    <p className="mt-1 font-label text-[10px] tracking-[0.18em] uppercase text-clay">
                                        Save ₹{savings} · {pct}% off
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    {/* Copy */}
                    <div className="space-y-8 lg:pl-4" data-reveal data-reveal-delay="150">
                        <div>
                            <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-4 flex items-center gap-2">
                                <Gift size={13} />
                                Festive gifting
                            </p>
                            <h2 className="font-display italic text-4xl md:text-[3.4rem] leading-[1.02] tracking-[-0.015em] whitespace-pre-line">
                                {deal.title}
                            </h2>
                            {deal.subtitle ? <p className="mt-4 text-base md:text-lg text-parchment/70 leading-relaxed max-w-md">{deal.subtitle}</p> : null}
                        </div>

                        {deal.description ? <p className="text-[15px] text-parchment/55 leading-relaxed max-w-lg">{deal.description}</p> : null}

                        {deal.items?.length ? (
                            <div>
                                <p className="font-label text-[10px] tracking-[0.18em] uppercase text-millet/80 mb-4">What&apos;s inside</p>
                                <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    {deal.items.map((item, i) => (
                                        <li key={item} className="flex items-center gap-3 text-sm text-parchment/85">
                                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-millet/15 text-millet font-label text-[10px] ring-1 ring-millet/30">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-parchment/10 pt-6">
                            {TRUST.map(({ icon: Icon, label }) => (
                                <span key={label} className="inline-flex items-center gap-2 text-xs text-parchment/60">
                                    <Icon size={14} className="text-millet" strokeWidth={1.75} />
                                    {label}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {product ? (
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="group inline-flex items-center gap-2.5 bg-turmeric text-parchment px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-turmeric/25 transition-all duration-200 hover:bg-clay hover:shadow-clay/30"
                                >
                                    {adding ? <Check size={15} strokeWidth={2.5} /> : null}
                                    {adding ? 'Added to cart' : 'Add hamper to cart'}
                                    {!adding ? <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /> : null}
                                </button>
                            ) : (
                                <Link
                                    href={productHref}
                                    className="group inline-flex items-center gap-2.5 bg-turmeric text-parchment px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-turmeric/25 transition-all duration-200 hover:bg-clay"
                                >
                                    {deal.cta || 'Order Now'}
                                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            )}
                            <Link
                                href={detailsHref}
                                className="inline-flex items-center gap-1.5 text-parchment/60 hover:text-parchment text-sm font-medium transition underline decoration-parchment/20 underline-offset-4"
                            >
                                Full details
                            </Link>
                        </div>

                        <p className="text-xs text-parchment/40">
                            Gifting for a team or family?{' '}
                            <Link href="/bulk-order" className="text-millet/90 hover:text-millet underline underline-offset-4">
                                Order hampers in bulk
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function DealOfferSection() {
    const { homeDeals } = useCatalog();
    const deals = homeDeals && homeDeals.length ? homeDeals : [FALLBACK_DEAL];

    return (
        <>
            {deals.map((deal) => (
                <DealCard key={deal._id} deal={deal} />
            ))}
        </>
    );
}
