'use client';

import { ArrowRight, Check, Gift, Package, ShieldCheck, Truck, Users } from 'lucide-react';
import Image from 'next/image';
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
    items: ['Energy Bar', 'Coconut Cookies', 'Dry Fruit Cookies', 'Millet Bites', 'Decorative Diyas', 'Festive Greeting Card'],
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
    { icon: Users, label: 'Bulk orders welcome', href: '/bulk-order' },
];

/** "Energy bar, coconut cookies and a festive greeting card." from the deal's item list. */
function itemsSentence(items: string[]) {
    if (!items.length) return '';
    const parts = items.map((it, i) => (i === 0 ? it.charAt(0) + it.slice(1).toLowerCase() : it.toLowerCase()));
    const last = parts.pop()!;
    const lastWithArticle = /card|box/i.test(last) ? `a ${last}` : last;
    return parts.length ? `${parts.join(', ')} and ${lastWithArticle}.` : `${lastWithArticle}.`;
}

/** Festive hamper offer (design B3): photo left, price and add-to-cart right, trust strip below. */
function DealCard({ deal }: { deal: Deal }) {
    const { addToCart, toggleCart } = useCart();
    const { products } = useProducts();
    const slug = deal.productSlug?.trim();
    const product: Product | null = (slug && products.find((p) => p.slug === slug)) || null;
    const [adding, setAdding] = useState(false);

    const detailsHref = deal.ctaLink && deal.ctaLink.startsWith('/') && !deal.ctaLink.startsWith('/product/') ? deal.ctaLink : '/diwali';
    const productHref = slug ? `/product/${slug}` : detailsHref;
    const price = product?.price ?? deal.price;
    const originalPrice = product?.originalPrice ?? deal.originalPrice;
    const savings = originalPrice > price && price > 0 ? originalPrice - price : 0;
    const pct = savings ? Math.round((savings / originalPrice) * 100) : 0;
    const image = resolveImage(deal.image || undefined);
    const description = deal.items?.length ? itemsSentence(deal.items) : deal.subtitle;

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
        <section className="bg-butter">
            <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] bg-[#5a2a17] shadow-[0_34px_70px_-34px_rgba(90,42,23,0.65)]" data-reveal>
                        {deal.video ? (
                            <video autoPlay loop muted playsInline poster={image} className="absolute inset-0 h-full w-full object-cover">
                                <source src={deal.video} type="video/mp4" />
                            </video>
                        ) : deal.image && image.startsWith('/') ? (
                            <Image src={image} alt={deal.title} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
                        ) : deal.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={deal.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        ) : null}
                    </div>

                    <div className="min-w-0" data-reveal data-reveal-delay="120">
                        <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-rust">
                            <Gift size={14} />
                            Festive gifting
                        </p>
                        <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink md:text-[3.4rem]">
                            {deal.title}
                        </h2>
                        {description ? <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink/75">{description}</p> : null}

                        {price > 0 ? (
                            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                                <span className="font-display text-5xl font-semibold leading-none text-rust md:text-6xl">₹{price}</span>
                                {originalPrice > price ? <span className="text-lg text-ink/45 line-through">₹{originalPrice}</span> : null}
                                {pct > 0 ? (
                                    <span className="rounded-full bg-basil px-3 py-1.5 text-sm font-semibold text-cream">{pct}% OFF</span>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                            {product ? (
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="pressable group inline-flex items-center gap-2.5 rounded-full bg-rust px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(185,68,31,0.6)] transition hover:bg-clay"
                                >
                                    {adding ? <Check size={16} strokeWidth={2.5} /> : null}
                                    {adding ? 'Added to cart' : 'Add hamper to cart'}
                                    {!adding ? <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /> : null}
                                </button>
                            ) : (
                                <Link
                                    href={productHref}
                                    className="pressable group inline-flex items-center gap-2.5 rounded-full bg-rust px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-clay"
                                >
                                    {deal.cta || 'Order now'}
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            )}
                            <Link
                                href={detailsHref}
                                className="text-[15px] font-semibold text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink"
                            >
                                Full details
                            </Link>
                        </div>
                    </div>
                </div>

                <ul className="mt-10 grid grid-cols-2 gap-4 rounded-[22px] bg-white px-6 py-5 ring-1 ring-ink/[0.05] md:grid-cols-4 md:px-8">
                    {TRUST.map(({ icon: Icon, label, href }) => (
                        <li key={label} className="flex items-center gap-2.5 text-[15px] font-semibold text-ink md:justify-center">
                            <Icon size={17} className="shrink-0 text-rust" strokeWidth={1.9} />
                            {href ? (
                                <Link href={href} className="underline-offset-4 hover:underline">
                                    {label}
                                </Link>
                            ) : (
                                label
                            )}
                        </li>
                    ))}
                </ul>
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
