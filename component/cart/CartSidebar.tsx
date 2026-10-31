'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag, Trash2, Truck, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { resolveImage } from '@/lib/images';
import { formatInr } from '@/lib/orderUtils';

export default function CartSidebar() {
    const { items, isOpen, closeCart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
    const { settings } = useSettings();
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
    const hasFreeDeliveryProduct = items.some((item) => item.freeDelivery === true);
    const unlocked = totalPrice >= threshold || hasFreeDeliveryProduct;
    const remaining = Math.max(threshold - totalPrice, 0);
    const progress = unlocked ? 100 : Math.min(100, Math.round((totalPrice / threshold) * 100));

    // Escape closes, body stops scrolling, focus lands on the close button
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeCart();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = window.setTimeout(() => closeBtnRef.current?.focus(), 120);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
            window.clearTimeout(t);
        };
    }, [isOpen, closeCart]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-parchment text-ink shadow-[-24px_0_60px_-30px_rgba(36,31,22,0.55)] transition-[transform,visibility] duration-300 ease-out ${
                    isOpen ? 'visible translate-x-0' : 'pointer-events-none invisible translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-ink/[0.08] px-6 pt-5 pb-4">
                    <div>
                        <p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">Vrateez</p>
                        <h2 className="mt-1 font-display italic text-2xl leading-none text-ink">
                            Your cart{' '}
                            <span className="not-italic text-ink/40">({totalItems})</span>
                        </h2>
                    </div>
                    <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={closeCart}
                        className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-ink/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {items.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink/30 ring-1 ring-ink/[0.08]">
                            <ShoppingBag size={26} strokeWidth={1.5} />
                        </span>
                        <p className="font-label text-[10px] tracking-[0.22em] uppercase text-clay">Nothing here yet</p>
                        <p className="mt-2 font-display italic text-2xl text-ink">Your cart is empty</p>
                        <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-ink/50">
                            Millet cookies, energy bars and vrat-friendly snacks are a tap away.
                        </p>
                        <Link
                            href="/shop"
                            onClick={closeCart}
                            className="pressable mt-7 inline-flex items-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                        >
                            Shop now
                            <ArrowRight size={15} />
                        </Link>
                        <button
                            type="button"
                            onClick={closeCart}
                            className="mt-4 text-xs font-semibold text-ink/45 underline decoration-ink/20 underline-offset-4 transition hover:text-ink"
                        >
                            Continue browsing
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Free delivery progress */}
                        <div className="px-6 pt-4">
                            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-ink/[0.08]">
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className={`inline-flex items-center gap-1.5 font-medium ${unlocked ? 'text-basil' : 'text-ink/70'}`}>
                                        {unlocked ? <Check size={14} strokeWidth={2.5} /> : <Truck size={14} />}
                                        {unlocked ? (
                                            'Free delivery unlocked'
                                        ) : (
                                            <>
                                                Add <span className="font-semibold text-ink">{formatInr(remaining)}</span> more for free delivery
                                            </>
                                        )}
                                    </span>
                                    <span className="font-label text-[10px] tracking-[0.14em] text-ink/40">{progress}%</span>
                                </div>
                                <div
                                    className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]"
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={progress}
                                    aria-label="Progress to free delivery"
                                >
                                    <div
                                        className={`h-full rounded-full transition-[width] duration-500 ease-out ${unlocked ? 'bg-basil' : 'bg-turmeric'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <ul className="space-y-3">
                                {items.map((item) => {
                                    const lineTotal = item.price * item.quantity;
                                    const lineOriginal = item.originalPrice * item.quantity;
                                    const hasDiscount = item.originalPrice > item.price && item.price > 0;
                                    const href = item.slug ? `/product/${item.slug}` : '/shop';
                                    return (
                                        <li
                                            key={item.id}
                                            className="flex gap-3.5 rounded-[22px] bg-white p-3 ring-1 ring-ink/[0.08]"
                                        >
                                            <Link
                                                href={href}
                                                onClick={closeCart}
                                                className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl bg-[#EFE6D3]"
                                            >
                                                <Image
                                                    src={resolveImage(item.image)}
                                                    alt={item.name}
                                                    fill
                                                    sizes="76px"
                                                    className="object-cover"
                                                />
                                            </Link>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={href}
                                                            onClick={closeCart}
                                                            className="block truncate text-sm font-semibold text-ink transition-colors hover:text-clay"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <p className="mt-0.5 text-[11px] text-ink/45">
                                                            {item.weight}
                                                            {item.freeDelivery ? <span className="ml-1.5 font-semibold text-basil">· Free delivery</span> : null}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/30 transition hover:bg-clay/10 hover:text-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                                                        aria-label={`Remove ${item.name}`}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className="mt-2.5 flex items-center justify-between gap-3">
                                                    {/* Quantity stepper */}
                                                    <div className="inline-flex items-center rounded-full bg-parchment/70 ring-1 ring-ink/15">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-ink/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                                                            aria-label={`Decrease quantity of ${item.name}`}
                                                        >
                                                            <Minus size={13} />
                                                        </button>
                                                        <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums text-ink" aria-live="polite">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-ink/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric/40"
                                                            aria-label={`Increase quantity of ${item.name}`}
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-display text-base leading-none text-ink">{formatInr(lineTotal)}</p>
                                                        {hasDiscount ? (
                                                            <p className="mt-1 text-[11px] text-ink/35 line-through">{formatInr(lineOriginal)}</p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <button
                                type="button"
                                onClick={clearCart}
                                className="mt-4 text-[11px] font-medium text-ink/35 transition hover:text-clay"
                            >
                                Clear cart
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-ink/[0.08] bg-white/50 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-ink/60">Subtotal</span>
                                <span className="font-display text-2xl text-ink">{formatInr(totalPrice)}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-ink/40">Shipping calculated at checkout.</p>
                            <Link
                                href="/checkout"
                                onClick={closeCart}
                                className="group pressable mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-turmeric py-4 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                            >
                                Checkout
                                <span className="text-parchment/70">·</span>
                                {formatInr(totalPrice)}
                                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={closeCart}
                                className="mt-3 block w-full text-center text-xs font-semibold text-ink/55 underline decoration-ink/20 underline-offset-4 transition hover:text-ink"
                            >
                                Continue shopping
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
