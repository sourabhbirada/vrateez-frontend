'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, Mail, MessageCircle, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

function PaymentErrorContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');
    const message = searchParams.get('message');
    const { user } = useAuth();
    const { settings } = useSettings();

    const decoded = message ? decodeURIComponent(message) : 'Payment could not be completed or verified.';

    const successHref =
        orderId && (user?.email || email)
            ? `/order-success?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(user?.email || email || '')}`
            : null;

    const supportEmail = settings?.contact?.supportEmail || 'vrateezfoodspvtltd@gmail.com';
    const whatsapp = settings?.contact?.whatsapp;
    const subject = orderId ? `Payment issue · order ${orderId}` : 'Payment issue';
    const waText = orderId ? `Hi, my payment did not go through for order ${orderId}. Can you help?` : 'Hi, my payment did not go through. Can you help?';

    return (
        <main className="min-h-screen bg-parchment px-4 py-12 md:py-16">
            <div className="mx-auto max-w-lg" data-reveal>
                <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)]">
                    <div className="relative border-b border-clay/15 bg-clay/[0.07] px-6 py-8 text-center">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.25]"
                            aria-hidden="true"
                            style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #E4A93D 0%, transparent 55%)' }}
                        />
                        <div className="relative">
                            <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-clay text-parchment shadow-[0_0_0_10px_rgba(156,66,33,0.12)]">
                                <AlertTriangle size={30} />
                            </span>
                            <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay">Payment</p>
                            <h1 className="mt-2 font-display italic text-3xl leading-none text-ink md:text-4xl">Payment not completed.</h1>
                            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">{decoded}</p>
                        </div>
                    </div>

                    <div className="space-y-4 px-6 py-6 text-sm text-ink/60">
                        {orderId && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-parchment/70 px-4 py-3 ring-1 ring-ink/[0.06]">
                                <span className="font-label text-[10px] tracking-[0.16em] uppercase text-ink/45">Order ID</span>
                                <span className="font-label break-all text-sm text-ink">{orderId}</span>
                            </div>
                        )}
                        <p className="leading-relaxed">
                            If money was debited, it is usually auto-refunded by Razorpay within a few days. You can try paying
                            again from your orders, or contact support with the order ID above.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row">
                        {user ? (
                            <Link
                                href="/account/orders"
                                className="pressable group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                            >
                                <Package size={16} />
                                My orders
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        ) : successHref ? (
                            <Link
                                href={successHref}
                                className="pressable group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                            >
                                <Package size={16} />
                                View order status
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        ) : null}
                        <Link
                            href="/shop"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5"
                        >
                            <ShoppingBag size={16} />
                            Back to shop
                        </Link>
                    </div>

                    <div className="border-t border-ink/[0.06] bg-parchment/50 px-6 py-4">
                        <p className="font-label text-[10px] tracking-[0.16em] uppercase text-ink/45">Need a hand?</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <a
                                href={`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-ink ring-1 ring-ink/10 transition hover:bg-ink/5"
                            >
                                <Mail size={13} className="text-clay" />
                                Email support
                            </a>
                            {whatsapp ? (
                                <a
                                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-ink ring-1 ring-ink/10 transition hover:bg-ink/5"
                                >
                                    <MessageCircle size={13} className="text-[#128C7E]" />
                                    WhatsApp
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>

                <Link
                    href="/shop"
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/50 transition hover:text-ink"
                >
                    <ArrowLeft size={16} />
                    Continue browsing
                </Link>
            </div>
        </main>
    );
}

export default function OrderPaymentErrorPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-parchment flex items-center justify-center text-sm text-ink/50">Loading…</main>
            }
        >
            <PaymentErrorContent />
        </Suspense>
    );
}
