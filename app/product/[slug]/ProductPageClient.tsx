'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
    ArrowRight,
    Banknote,
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Leaf,
    Lock,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { getProductBySlugApi, getProductsApi } from '@/lib/api/productApi';
import type { Product as ApiProduct, ProductCategory } from '@/lib/api/types';
import { getProductCategoryLabel } from '@/lib/api/types';
import { getEffectiveUnitPrice, getPackLabel, getPackTotal, type PackOption } from '@/lib/packPricing';
import { trackViewItem } from '@/lib/analytics';
import { resolveImage } from '@/lib/images';
import { formatInr } from '@/lib/orderUtils';
import ProductCard from '@/component/product/ProductCard';

interface ProductView {
    id: string | number;
    name: string;
    slug: string;
    category: ProductCategory;
    image: string;
    images: string[];
    rating: number;
    reviews: number;
    price: number;
    originalPrice: number;
    discount: string;
    weight: string;
    description: string;
    benefits: string[];
    ingredients: string;
    nutritionHighlights: string[];
    amazonUrl?: string;
    packOptions?: PackOption[];
    customization?: ApiProduct['customization'];
    freeDelivery?: boolean;
}

type DetailTab = 'description' | 'benefits' | 'ingredients';

const inputBase =
    'w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:ring-2 focus:ring-turmeric/30 focus:border-turmeric';

function mapApiProductToView(p: ApiProduct): ProductView {
    return {
        id: p._id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        image: p.image,
        images: p.images,
        rating: p.rating,
        reviews: p.reviews,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        weight: p.weight,
        description: p.description,
        benefits: p.benefits,
        ingredients: p.ingredients,
        nutritionHighlights: p.nutritionHighlights,
        amazonUrl: p.amazonUrl,
        packOptions: p.packOptions || [],
        customization: p.customization,
        freeDelivery: p.freeDelivery,
    };
}

function PackChoice({
    selected,
    onClick,
    title,
    units,
    unitPrice,
    total,
    badge,
}: {
    selected: boolean;
    onClick: () => void;
    title: string;
    units: number;
    unitPrice: number;
    total: number;
    badge?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`relative flex flex-col rounded-2xl p-4 text-left ring-1 transition ${
                selected
                    ? 'bg-turmeric/[0.07] ring-turmeric shadow-[0_0_0_3px_rgba(196,113,31,0.12)]'
                    : 'bg-white ring-ink/10 hover:ring-ink/25'
            }`}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{title}</span>
                {badge ? (
                    <span className="rounded-full bg-basil px-2 py-0.5 font-label text-[9px] tracking-[0.12em] uppercase text-parchment">
                        {badge}
                    </span>
                ) : null}
            </span>
            <span className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-display text-xl leading-none text-ink">{formatInr(total)}</span>
                <span className="text-[11px] text-ink/50">
                    {units} pc{units === 1 ? '' : 's'} · {formatInr(unitPrice)} each
                </span>
            </span>
            {selected ? (
                <span className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-turmeric text-parchment ring-4 ring-parchment">
                    <Check size={12} strokeWidth={3} />
                </span>
            ) : null}
        </button>
    );
}

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [product, setProduct] = useState<ProductView | null>(null);
    const [allProducts, setAllProducts] = useState<ProductView[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { settings } = useSettings();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedPackUnits, setSelectedPackUnits] = useState(1);
    const [activeTab, setActiveTab] = useState<DetailTab>('description');
    const [customSelections, setCustomSelections] = useState<Record<string, string>>({});
    const [customError, setCustomError] = useState('');
    const [added, setAdded] = useState(false);

    useEffect(() => {
        async function loadProduct() {
            try {
                setLoading(true);
                const [apiProduct, apiList] = await Promise.all([
                    getProductBySlugApi(slug),
                    getProductsApi({ limit: 100 }),
                ]);

                setProduct(mapApiProductToView(apiProduct));
                trackViewItem({ id: apiProduct._id, name: apiProduct.name, price: apiProduct.price, category: apiProduct.category });
                setAllProducts(apiList.items.map(mapApiProductToView));
                const defaults: Record<string, string> = {};
                apiProduct.customization?.options?.forEach((opt) => {
                    if (opt.type === 'select' && opt.choices?.[0]) {
                        defaults[opt.key] = opt.choices[0].value;
                    } else {
                        defaults[opt.key] = '';
                    }
                });
                setCustomSelections(defaults);
            } catch (error) {
                console.error('Error loading product:', error);
                setProduct(null);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        }

        void loadProduct();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-3 text-ink/50">
                <span className="h-10 w-10 rounded-full border-2 border-turmeric/30 border-t-turmeric animate-spin" />
                <p className="text-sm">Loading product…</p>
            </main>
        );
    }

    if (!product) {
        return notFound();
    }

    const hasPackOptions = (product.packOptions?.length ?? 0) > 0;
    const customizationEnabled = Boolean(product.customization?.enabled && product.customization.options?.length);
    const orderQuantity = hasPackOptions ? selectedPackUnits : quantity;
    const customizationDelta = (product.customization?.options || []).reduce((sum, opt) => {
        if (opt.type !== 'select') return sum;
        const selected = customSelections[opt.key];
        const choice = opt.choices?.find((c) => c.value === selected);
        return sum + (choice?.priceDelta || 0);
    }, 0);
    const unitPrice = getEffectiveUnitPrice(product, orderQuantity) + customizationDelta;
    const lineTotal = getPackTotal(
        { ...product, price: product.price + customizationDelta },
        orderQuantity
    );

    const handleAddToCart = () => {
        if (customizationEnabled) {
            for (const opt of product.customization?.options || []) {
                if (opt.required && !String(customSelections[opt.key] || '').trim()) {
                    setCustomError(`Please choose: ${opt.label}`);
                    return;
                }
            }
        }
        setCustomError('');

        const customParts = (product.customization?.options || [])
            .map((opt) => {
                const raw = customSelections[opt.key];
                if (!raw) return null;
                if (opt.type === 'select') {
                    const choice = opt.choices?.find((c) => c.value === raw);
                    return `${opt.label}: ${choice?.label || raw}`;
                }
                return `${opt.label}: ${raw}`;
            })
            .filter(Boolean);

        const customSuffix = customParts.length ? ` (${customParts.join(', ')})` : '';

        addToCart({
            id: String(product.id),
            slug: product.slug,
            name: `${product.name}${customSuffix}`,
            image: product.image,
            price: unitPrice,
            originalPrice: product.originalPrice + customizationDelta,
            weight: product.weight,
            quantity: orderQuantity,
            freeDelivery: product.freeDelivery,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
    };

    const handleRelatedAdd = (rp: ProductView) => {
        addToCart({
            id: String(rp.id),
            slug: rp.slug,
            name: rp.name,
            image: rp.image,
            price: rp.price,
            originalPrice: rp.originalPrice,
            weight: rp.weight,
            freeDelivery: rp.freeDelivery,
        });
    };

    // Related products (same category, different id)
    const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const categoryLabel = getProductCategoryLabel(product.category);
    const categoryHref = `/shop?category=${encodeURIComponent(product.category)}`;
    const gallery = product.images?.length ? product.images : [product.image].filter(Boolean);
    const heroImage = gallery[selectedImage] ?? gallery[0];
    const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
    const codEnabled = settings?.shipping?.paymentMethods?.cod ?? true;
    const savingsPct =
        product.originalPrice > product.price && product.price > 0
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
    const strikePrice = product.originalPrice + customizationDelta;

    const tabs: Array<{ id: DetailTab; label: string }> = [
        { id: 'description', label: 'Description' },
        ...(product.benefits.length ? [{ id: 'benefits' as const, label: 'Benefits' }] : []),
        ...(product.ingredients ? [{ id: 'ingredients' as const, label: 'Ingredients' }] : []),
    ];
    const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : 'description';

    const trust = [
        { icon: Truck, label: product.freeDelivery ? 'Free delivery on this item' : `Free delivery above ${formatInr(threshold)}` },
        codEnabled ? { icon: Banknote, label: 'Cash on delivery' } : { icon: Lock, label: 'Secure payments' },
        { icon: ShieldCheck, label: 'FSSAI certified' },
        { icon: Leaf, label: 'Vrat friendly' },
    ];

    return (
        <main className="bg-parchment min-h-screen pb-24 lg:pb-0">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8">
                <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4">
                    <ol className="flex min-w-0 items-center gap-1.5 text-xs text-ink/45">
                        <li className="shrink-0">
                            <Link href="/" className="transition hover:text-ink">Home</Link>
                        </li>
                        <li aria-hidden="true" className="shrink-0"><ChevronRight size={12} /></li>
                        <li className="shrink-0">
                            <Link href="/shop" className="transition hover:text-ink">Shop</Link>
                        </li>
                        <li aria-hidden="true" className="shrink-0"><ChevronRight size={12} /></li>
                        <li className="shrink-0">
                            <Link href={categoryHref} className="transition hover:text-ink">{categoryLabel}</Link>
                        </li>
                        <li aria-hidden="true" className="hidden sm:block shrink-0"><ChevronRight size={12} /></li>
                        <li className="hidden sm:block truncate text-ink/70">{product.name}</li>
                    </ol>
                    <Link href="/shop" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ink/60 transition hover:text-ink">
                        <ChevronLeft size={14} />
                        Back to shop
                    </Link>
                </nav>
            </div>

            {/* Product detail */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-14 md:pb-20 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
                {/* Gallery */}
                <div className="lg:sticky lg:top-24">
                    <div data-reveal>
                        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#EFE6D3] ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)]">
                            <Image
                                key={heroImage}
                                src={resolveImage(heroImage)}
                                alt={product.name}
                                fill
                                priority
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                className="object-cover"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                                {product.discount || savingsPct > 0 ? (
                                    <span className="inline-flex items-center rounded-full bg-basil px-2.5 py-1 font-label text-[10px] tracking-[0.14em] uppercase text-parchment shadow-sm">
                                        {product.discount || `${savingsPct}% off`}
                                    </span>
                                ) : null}
                                {product.freeDelivery ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-parchment/90 px-2.5 py-1 font-label text-[10px] tracking-[0.12em] uppercase text-basil ring-1 ring-basil/15 backdrop-blur">
                                        <Truck size={11} strokeWidth={2.25} />
                                        Free delivery
                                    </span>
                                ) : null}
                            </div>
                            {gallery.length > 1 ? (
                                <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-2.5 py-1 font-label text-[10px] text-parchment backdrop-blur">
                                    {selectedImage + 1} / {gallery.length}
                                </span>
                            ) : null}
                        </div>
                        {gallery.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
                                {gallery.map((img, i) => (
                                    <button
                                        key={`${img}-${i}`}
                                        type="button"
                                        onClick={() => setSelectedImage(i)}
                                        aria-label={`View image ${i + 1}`}
                                        aria-pressed={i === selectedImage}
                                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#EFE6D3] ring-2 transition ${
                                            i === selectedImage ? 'ring-turmeric' : 'ring-transparent hover:ring-ink/20'
                                        }`}
                                    >
                                        <Image src={resolveImage(img)} alt="" fill sizes="80px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div data-reveal data-reveal-delay="120">
                    <Link href={categoryHref} className="font-label text-[10px] tracking-[0.24em] uppercase text-clay transition hover:text-ink">
                        {categoryLabel}
                    </Link>
                    <h1 className="mt-3 font-display italic text-4xl md:text-5xl leading-none text-ink">{product.name}</h1>

                    {/* Rating */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < Math.round(product.rating) ? 'fill-millet text-millet' : 'text-ink/15'}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-ink/55">
                            {product.rating ? product.rating.toFixed(1) : '—'} · {product.reviews} review{product.reviews === 1 ? '' : 's'}
                        </span>
                        {product.weight ? (
                            <>
                                <span className="text-ink/20">·</span>
                                <span className="text-sm text-ink/55">{product.weight}</span>
                            </>
                        ) : null}
                    </div>

                    {/* Price */}
                    <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-2">
                        <span className="font-display text-4xl leading-none text-ink">
                            {formatInr(hasPackOptions ? lineTotal : unitPrice)}
                        </span>
                        {hasPackOptions ? (
                            <span className="pb-0.5 text-sm text-ink/50">
                                {formatInr(unitPrice)} / pc · {orderQuantity} pcs
                            </span>
                        ) : (
                            <>
                                {strikePrice > unitPrice ? (
                                    <span className="pb-0.5 text-base text-ink/35 line-through">{formatInr(strikePrice)}</span>
                                ) : null}
                                {savingsPct > 0 ? (
                                    <span className="rounded-full bg-basil/10 px-2.5 py-1 text-xs font-semibold text-basil">
                                        Save {savingsPct}%
                                    </span>
                                ) : product.discount ? (
                                    <span className="rounded-full bg-basil/10 px-2.5 py-1 text-xs font-semibold text-basil">
                                        {product.discount}
                                    </span>
                                ) : null}
                            </>
                        )}
                    </div>
                    <p className="mt-1.5 text-xs text-ink/45">
                        {hasPackOptions ? 'Pack pricing · bigger packs cost less per piece' : 'Inclusive of all taxes'}
                    </p>

                    {hasPackOptions && (
                        <div className="mt-7">
                            <p className="mb-3 font-label text-[10px] tracking-[0.2em] uppercase text-ink/55">Choose pack size</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <PackChoice
                                    selected={selectedPackUnits === 1}
                                    onClick={() => setSelectedPackUnits(1)}
                                    title="Single pack"
                                    units={1}
                                    unitPrice={product.price + customizationDelta}
                                    total={product.price + customizationDelta}
                                />
                                {product.packOptions?.map((pack) => {
                                    const total = getPackTotal(
                                        { ...product, price: product.price + customizationDelta },
                                        pack.units
                                    );
                                    const perUnit = getEffectiveUnitPrice(product, pack.units) + customizationDelta;
                                    return (
                                        <PackChoice
                                            key={pack.units}
                                            selected={selectedPackUnits === pack.units}
                                            onClick={() => setSelectedPackUnits(pack.units)}
                                            title={getPackLabel(pack)}
                                            units={pack.units}
                                            unitPrice={perUnit}
                                            total={total}
                                            badge={pack.discountPercent > 0 ? `${pack.discountPercent}% off` : undefined}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {customizationEnabled && (
                        <div className="mt-7 space-y-5 rounded-[22px] bg-white p-5 ring-1 ring-ink/[0.08]">
                            <div className="flex items-center gap-2">
                                <Sparkles size={15} className="text-clay" />
                                <p className="font-display text-lg leading-tight text-ink">
                                    {product.customization?.title || 'Customize your product'}
                                </p>
                            </div>
                            {(product.customization?.options || []).map((opt) => (
                                <div key={opt.key}>
                                    <p className="mb-2 font-label text-[10px] tracking-[0.16em] uppercase text-ink/55">
                                        {opt.label}
                                        {opt.required ? <span className="text-clay"> *</span> : null}
                                    </p>
                                    {opt.type === 'text' ? (
                                        <input
                                            type="text"
                                            value={customSelections[opt.key] || ''}
                                            onChange={(e) =>
                                                setCustomSelections((prev) => ({
                                                    ...prev,
                                                    [opt.key]: e.target.value,
                                                }))
                                            }
                                            placeholder={`Enter ${opt.label.toLowerCase()}`}
                                            className={inputBase}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {(opt.choices || []).map((choice) => {
                                                const selected = customSelections[opt.key] === choice.value;
                                                const delta = choice.priceDelta || 0;
                                                return (
                                                    <button
                                                        key={choice.value}
                                                        type="button"
                                                        aria-pressed={selected}
                                                        onClick={() =>
                                                            setCustomSelections((prev) => ({
                                                                ...prev,
                                                                [opt.key]: choice.value,
                                                            }))
                                                        }
                                                        className={`relative rounded-2xl p-3 text-left ring-1 transition ${
                                                            selected
                                                                ? 'bg-turmeric/[0.07] ring-turmeric shadow-[0_0_0_3px_rgba(196,113,31,0.12)]'
                                                                : 'bg-parchment/50 ring-ink/10 hover:ring-ink/25'
                                                        }`}
                                                    >
                                                        {choice.image ? (
                                                            <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-[#EFE6D3]">
                                                                <Image
                                                                    src={resolveImage(choice.image)}
                                                                    alt={choice.label}
                                                                    fill
                                                                    sizes="(min-width: 640px) 160px, 45vw"
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : null}
                                                        <p className="text-sm font-semibold text-ink">{choice.label}</p>
                                                        {delta !== 0 ? (
                                                            <p className="mt-0.5 text-xs text-ink/50">
                                                                {delta > 0 ? '+' : '-'}
                                                                {formatInr(Math.abs(delta))}
                                                            </p>
                                                        ) : null}
                                                        {selected ? (
                                                            <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-turmeric text-parchment">
                                                                <Check size={11} strokeWidth={3} />
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {customError ? (
                                <p className="rounded-xl bg-clay/10 px-3.5 py-2.5 text-sm text-clay ring-1 ring-clay/20">{customError}</p>
                            ) : null}
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {!hasPackOptions ? (
                            <div className="inline-flex h-[52px] items-center self-start rounded-full bg-white ring-1 ring-ink/12">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="flex h-full w-12 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-semibold tabular-nums text-ink">{quantity}</span>
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="flex h-full w-12 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className={`pressable inline-flex flex-1 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg transition ${
                                added ? 'bg-basil shadow-basil/25' : 'bg-turmeric shadow-turmeric/25 hover:bg-clay'
                            }`}
                        >
                            {added ? <Check size={16} strokeWidth={3} /> : <ShoppingBag size={16} />}
                            {added ? 'Added to cart' : `Add to cart · ${formatInr(lineTotal)}`}
                        </button>
                    </div>

                    {product.amazonUrl ? (
                        <a
                            href={product.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5"
                        >
                            <ExternalLink size={15} />
                            Also available on Amazon
                        </a>
                    ) : null}

                    {/* Trust row */}
                    <ul className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {trust.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-2.5 rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-ink/[0.06]">
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-turmeric/10 text-clay">
                                    <Icon size={14} />
                                </span>
                                <span className="text-xs font-medium leading-tight text-ink/70">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Details */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16 items-start">
                    <div className="lg:sticky lg:top-28" data-reveal>
                        <p className="mb-3 font-label text-[10px] tracking-[0.24em] uppercase text-clay">The details</p>
                        <h2 className="font-display italic text-3xl md:text-4xl leading-none text-ink">Everything on the label.</h2>
                        <p className="mt-3 max-w-sm text-sm text-ink/55">
                            Short ingredient lists, no powders, no palm oil. Read it all before you order.
                        </p>
                        {product.nutritionHighlights.length ? (
                            <dl className="mt-6 grid grid-cols-2 gap-3">
                                {product.nutritionHighlights.slice(0, 4).map((n, i) => (
                                    <div key={`${n}-${i}`} className="rounded-2xl bg-ink px-4 py-4 text-parchment ring-1 ring-ink/10">
                                        <dt className="font-label text-[9px] tracking-[0.18em] uppercase text-millet/80">Highlight</dt>
                                        <dd className="mt-1.5 font-display text-lg leading-tight">{n}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : null}
                    </div>

                    <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08]" data-reveal data-reveal-delay="120">
                        <div className="flex gap-1 overflow-x-auto border-b border-ink/[0.06] px-3 md:px-4 [scrollbar-width:none]" role="tablist">
                            {tabs.map((tab) => {
                                const active = currentTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`-mb-px shrink-0 border-b-2 px-3 pb-3 pt-4 text-sm font-semibold transition ${
                                            active ? 'border-turmeric text-ink' : 'border-transparent text-ink/40 hover:text-ink/70'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-5 md:p-7">
                            {currentTab === 'description' && (
                                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/65">{product.description}</p>
                            )}
                            {currentTab === 'benefits' && (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.benefits.map((b, i) => (
                                        <li key={`${b}-${i}`} className="flex items-start gap-3 rounded-2xl bg-parchment/70 px-4 py-3 ring-1 ring-ink/[0.06]">
                                            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-basil text-parchment">
                                                <Check size={12} strokeWidth={3} />
                                            </span>
                                            <span className="text-sm leading-snug text-ink/75">{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {currentTab === 'ingredients' && (
                                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/65">{product.ingredients}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="border-t border-ink/[0.06]">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
                        <div className="mb-8 flex items-end justify-between gap-4" data-reveal>
                            <div>
                                <p className="mb-3 font-label text-[10px] tracking-[0.24em] uppercase text-clay">Pairs well with</p>
                                <h2 className="font-display italic text-3xl md:text-4xl leading-none text-ink">You may also like.</h2>
                            </div>
                            <Link
                                href={categoryHref}
                                className="hidden items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-ink sm:inline-flex"
                            >
                                All {categoryLabel}
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4" data-reveal data-reveal-delay="120">
                            {related.map((rp) => (
                                <ProductCard key={rp.id} product={rp} onAdd={handleRelatedAdd} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Mobile sticky CTA */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-parchment/95 px-4 py-3 backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0">
                        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink/45">
                            {orderQuantity} pc{orderQuantity === 1 ? '' : 's'}
                        </p>
                        <p className="font-display text-xl leading-none text-ink">{formatInr(lineTotal)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`pressable ml-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-parchment shadow-lg transition ${
                            added ? 'bg-basil shadow-basil/25' : 'bg-turmeric shadow-turmeric/25 hover:bg-clay'
                        }`}
                    >
                        {added ? <Check size={15} strokeWidth={3} /> : <ShoppingBag size={15} />}
                        {added ? 'Added' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </main>
    );
}
