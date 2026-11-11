'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/component/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useCategories, useProducts } from '@/context/CatalogContext';
import type { Product as ApiProduct, ProductCategory } from '@/lib/api/types';
import { normalizeProductCategory } from '@/lib/api/types';


interface ShopProduct {
    id: string;
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
    freeDelivery?: boolean;
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'rating';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
    { key: 'default', label: 'Featured' },
    { key: 'rating', label: 'Top rated' },
    { key: 'price-asc', label: 'Price: low to high' },
    { key: 'price-desc', label: 'Price: high to low' },
];

function toShopProduct(p: ApiProduct): ShopProduct {
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
        freeDelivery: p.freeDelivery,
    };
}

/**
 * Shop grid. The server page passes the category and search from the URL, and the
 * product list comes from the server-rendered catalogue, so the grid is in the HTML.
 */
export default function ShopClient({ initialCategory: initialCategoryParam, initialQuery }: { initialCategory: string; initialQuery: string }) {
    const router = useRouter();
    const { settings } = useSettings();
    const { addToCart } = useCart();
    const { products: catalogProducts, loaded: productsLoaded } = useProducts();
    const { categories: catalogCategories } = useCategories();

    const initialCategory = normalizeProductCategory(initialCategoryParam || 'all');
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [query, setQuery] = useState(initialQuery);
    const [sortBy, setSortBy] = useState<SortKey>('default');
    const allProducts = useMemo(() => catalogProducts.map(toShopProduct), [catalogProducts]);
    const categories = useMemo(
        () => [{ key: 'all', label: 'All' }, ...catalogCategories.map((cat) => ({ key: cat.slug, label: cat.name }))],
        [catalogCategories],
    );
    const loading = !productsLoaded;

    // Header search and footer category links navigate here; follow the new URL values.
    useEffect(() => {
        setActiveCategory(normalizeProductCategory(initialCategoryParam || 'all'));
        setQuery(initialQuery);
    }, [initialCategoryParam, initialQuery]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = activeCategory === 'all' ? [...allProducts] : allProducts.filter((p) => p.category === activeCategory);
        if (q) {
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q),
            );
        }
        if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') list.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
        return list;
    }, [allProducts, activeCategory, query, sortBy]);

    const selectCategory = (key: string) => {
        setActiveCategory(key);
        const params = new URLSearchParams(window.location.search);
        if (key === 'all') params.delete('category');
        else params.set('category', key);
        router.replace(`/shop${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    };

    const clearSearch = () => {
        setQuery('');
        const params = new URLSearchParams(window.location.search);
        params.delete('search');
        params.delete('q');
        router.replace(`/shop${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    };

    const handleAddToCart = (product: ShopProduct) => {
        addToCart({
            id: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            weight: product.weight,
            freeDelivery: product.freeDelivery,
        });
    };

    const activeLabel = categories.find((c) => c.key === activeCategory)?.label || 'All';
    const threshold = settings?.shipping?.freeShippingThreshold ?? 499;

    return (
        <main className="bg-parchment min-h-screen">
            {/* Hero band */}
            <section className="relative overflow-hidden bg-ink text-parchment">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(ellipse at 85% 20%, #E4A93D 0%, transparent 45%)' }}
                />
                <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-12 md:pt-14 md:pb-16">
                    <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-3">The shop</p>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h1 className="font-display italic text-4xl md:text-5xl leading-[1.05]">
                            {query ? `Results for “${query}”` : activeCategory === 'all' ? 'All snacks' : activeLabel}
                        </h1>
                        <p className="text-sm text-parchment/60">
                            {loading ? 'Loading…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`} · free delivery above ₹{threshold}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky filter bar */}
            <div className="sticky top-16 md:top-20 z-30 border-b border-ink/[0.08] bg-parchment/90 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {categories.map((cat) => {
                            const active = activeCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => selectCategory(cat.key)}
                                    className={`shrink-0 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition ${
                                        active ? 'bg-ink text-parchment shadow' : 'bg-white/70 text-ink/70 ring-1 ring-ink/10 hover:bg-white hover:text-ink'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                    <label className="relative shrink-0">
                        <ArrowUpDown size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortKey)}
                            aria-label="Sort products"
                            className="appearance-none rounded-full bg-white/70 ring-1 ring-ink/10 pl-8 pr-8 py-2 text-xs md:text-sm font-semibold text-ink outline-none focus:ring-turmeric/40"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.key} value={o.key}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <SlidersHorizontal size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" />
                    </label>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
                {query ? (
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-ink/10 pl-4 pr-2 py-1.5 text-sm text-ink">
                        <Search size={14} className="text-clay" />
                        <span>“{query}”</span>
                        <button type="button" onClick={clearSearch} aria-label="Clear search" className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-ink/5">
                            <X size={13} />
                        </button>
                    </div>
                ) : null}

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse rounded-[22px] bg-white/70 ring-1 ring-ink/[0.06] overflow-hidden">
                                <div className="aspect-[4/5] bg-ink/[0.05]" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 w-1/3 rounded bg-ink/[0.06]" />
                                    <div className="h-4 w-3/4 rounded bg-ink/[0.08]" />
                                    <div className="h-6 w-1/3 rounded bg-ink/[0.06]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filtered.map((product, i) => (
                            <div key={product.id} data-reveal data-reveal-delay={String((i % 4) * 70)}>
                                <ProductCard product={product} onAdd={handleAddToCart} priority={i < 4} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] px-6 py-16 text-center">
                        <p className="font-display italic text-2xl text-ink">Nothing matches that yet.</p>
                        <p className="mt-2 text-sm text-ink/55">Try another category or clear the search.</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    clearSearch();
                                    selectCategory('all');
                                }}
                                className="rounded-full bg-turmeric px-6 py-3 text-sm font-semibold text-parchment hover:bg-clay transition"
                            >
                                Show everything
                            </button>
                            <Link href="/occasions" className="rounded-full ring-1 ring-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5 transition">
                                See upcoming fasts and festivals
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
