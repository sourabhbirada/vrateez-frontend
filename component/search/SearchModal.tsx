'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowUpRight, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getProductsApi } from '@/lib/api/productApi';
import { getProductCategoryLabel, type Product } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { formatInr } from '@/lib/orderUtils';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_TAGS = ['Cookies', 'Energy Bar', 'Almond', 'Blueberry', 'Millet', 'Vrat'];
const MAX_VISIBLE = 8;

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    // null until the first catalogue load resolves; later opens refresh in the background
    const [products, setProducts] = useState<Product[] | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Reset the query whenever the sheet closes (state adjusted during render, no effect needed)
    const [prevOpen, setPrevOpen] = useState(isOpen);
    if (isOpen !== prevOpen) {
        setPrevOpen(isOpen);
        if (!isOpen) setQuery('');
    }

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        getProductsApi({ limit: 100 })
            .then(res => {
                if (!cancelled) setProducts(res.items);
            })
            .catch(() => {
                if (!cancelled) setProducts(prev => prev ?? []);
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const t = window.setTimeout(() => inputRef.current?.focus(), 80);
        return () => window.clearTimeout(t);
    }, [isOpen]);

    // Escape closes, and the page behind stops scrolling while the sheet is open
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const trimmed = query.trim();
    const hasQuery = trimmed.length > 0;
    const needle = trimmed.toLowerCase();
    const loading = products === null;

    const results = hasQuery && products
        ? products.filter(p =>
            p.name.toLowerCase().includes(needle) ||
            p.category.toLowerCase().includes(needle) ||
            p.description.toLowerCase().includes(needle)
        )
        : [];

    const shopHref = `/shop?search=${encodeURIComponent(trimmed)}`;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!hasQuery) return;
        router.push(shopHref);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />

            {/* Top sheet */}
            <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[8vh] md:pt-24">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search products"
                    className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[22px] bg-parchment text-ink ring-1 ring-ink/[0.08] shadow-[0_32px_80px_-24px_rgba(36,31,22,0.55)] animate-fadeIn"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Input row */}
                    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3 border-b border-ink/[0.08] px-5 py-4">
                        <Search size={20} strokeWidth={1.75} className="shrink-0 text-turmeric" />
                        <label htmlFor="site-search" className="sr-only">Search products</label>
                        <input
                            id="site-search"
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search cookies, bars, millet…"
                            autoComplete="off"
                            className="min-w-0 flex-1 bg-transparent font-display text-xl md:text-2xl text-ink placeholder:italic placeholder:text-ink/30 outline-none [&::-webkit-search-cancel-button]:appearance-none"
                        />
                        <div className="flex shrink-0 items-center gap-1.5">
                            {hasQuery && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/[0.06] hover:text-ink"
                                    aria-label="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="hidden rounded-md px-2 py-1 font-label text-[10px] tracking-[0.18em] uppercase text-ink/45 ring-1 ring-ink/12 transition hover:bg-ink/[0.05] hover:text-ink sm:inline-flex"
                            >
                                Esc
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/[0.06] hover:text-ink sm:hidden"
                                aria-label="Close search"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Body */}
                    <div className="max-h-[min(60vh,460px)] overflow-y-auto">

                        {/* Empty state — popular tags */}
                        {!hasQuery && (
                            <div className="px-5 py-5">
                                <p className="mb-3 font-label text-[10px] tracking-[0.22em] uppercase text-clay">
                                    Popular
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setQuery(tag)}
                                            className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-ink/10 transition hover:bg-turmeric hover:text-parchment hover:ring-turmeric"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-5 flex items-center gap-1.5 text-[11px] text-ink/40">
                                    <CornerDownLeft size={12} />
                                    Press Enter to search the whole shop
                                </p>
                            </div>
                        )}

                        {/* Loading */}
                        {hasQuery && loading && (
                            <div className="flex items-center justify-center gap-2.5 px-5 py-10 text-sm text-ink/45">
                                <span className="h-4 w-4 rounded-full border-2 border-turmeric/30 border-t-turmeric animate-spin" />
                                Searching…
                            </div>
                        )}

                        {/* No results */}
                        {hasQuery && !loading && results.length === 0 && (
                            <div className="px-5 py-10 text-center">
                                <p className="font-display italic text-xl text-ink">
                                    Nothing for &ldquo;{trimmed}&rdquo;
                                </p>
                                <p className="mt-1 text-sm text-ink/45">Try a different keyword, or browse the shop.</p>
                                <Link
                                    href="/shop"
                                    onClick={onClose}
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5"
                                >
                                    Browse all products
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        )}

                        {/* Results */}
                        {hasQuery && !loading && results.length > 0 && (
                            <div className="p-2">
                                <p className="px-3 pt-2 pb-2 font-label text-[10px] tracking-[0.22em] uppercase text-clay">
                                    {results.length} result{results.length !== 1 ? 's' : ''}
                                </p>
                                <ul>
                                    {results.slice(0, MAX_VISIBLE).map(product => (
                                        <li key={product._id}>
                                            <Link
                                                href={`/product/${product.slug}`}
                                                onClick={onClose}
                                                className="group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition hover:bg-white focus:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-turmeric/40"
                                            >
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#EFE6D3] ring-1 ring-ink/[0.08]">
                                                    <Image
                                                        src={resolveImage(product.image)}
                                                        alt={product.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-ink group-hover:text-clay transition-colors">{product.name}</p>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink/45">
                                                        <span className="font-label text-[10px] tracking-[0.16em] uppercase text-turmeric/90">
                                                            {getProductCategoryLabel(product.category)}
                                                        </span>
                                                        {product.weight ? <span>· {product.weight}</span> : null}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2.5 text-right">
                                                    <div>
                                                        <p className="font-display text-base leading-none text-ink">{formatInr(product.price)}</p>
                                                        {product.discount ? (
                                                            <p className="mt-1 text-[11px] font-medium text-basil">{product.discount}</p>
                                                        ) : null}
                                                    </div>
                                                    <ArrowUpRight
                                                        size={15}
                                                        className="text-ink/25 transition-colors group-hover:text-turmeric"
                                                    />
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={shopHref}
                                    onClick={onClose}
                                    className="mt-1 flex items-center justify-between rounded-2xl border-t border-ink/[0.08] px-3 py-3 text-xs font-semibold text-ink/70 transition hover:text-ink"
                                >
                                    {results.length > MAX_VISIBLE ? `See all ${results.length} results in the shop` : 'See results in the shop'}
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
