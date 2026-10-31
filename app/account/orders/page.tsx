'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Package, Phone, RotateCcw, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getMyOrdersApi } from '@/lib/api/orderApi';
import type { Order } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { displayOrderId, formatDateTime, formatInr, paymentMethodLabel } from '@/lib/orderUtils';
import { OrderStatusStepper } from '@/component/order/TrackingTimeline';

const STATUS_PILL: Record<Order['orderStatus'], string> = {
    placed: 'bg-ink/5 text-ink/70',
    processing: 'bg-turmeric/10 text-clay',
    shipped: 'bg-millet/20 text-clay',
    delivered: 'bg-basil/10 text-basil',
    cancelled: 'bg-clay/10 text-clay',
};

const PAYMENT_PILL: Record<Order['paymentStatus'], string> = {
    paid: 'text-basil ring-basil/20',
    pending: 'text-turmeric ring-turmeric/25',
    failed: 'text-clay ring-clay/20',
    refunded: 'text-ink/60 ring-ink/15',
};

const CARD = 'rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)]';

export default function MyOrdersPage() {
    const { user, openLogin } = useAuth();
    const { addToCart } = useCart();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reorderedId, setReorderedId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await getMyOrdersApi();
                if (!cancelled) setOrders(list);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load orders');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const stats = useMemo(() => {
        const active = orders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'processing' || o.orderStatus === 'shipped').length;
        const delivered = orders.filter((o) => o.orderStatus === 'delivered').length;
        return { total: orders.length, active, delivered };
    }, [orders]);

    const handleReorder = (order: Order) => {
        order.items.forEach((item) => {
            addToCart({
                id: String(item.product),
                name: item.name,
                image: item.image,
                price: item.price,
                originalPrice: item.price,
                weight: '',
                quantity: item.quantity,
            });
        });
        setReorderedId(order._id);
        window.setTimeout(() => setReorderedId((cur) => (cur === order._id ? null : cur)), 1600);
    };

    if (!user) {
        return (
            <main className="min-h-screen bg-parchment flex items-center justify-center px-4 py-16">
                <div className={`${CARD} w-full max-w-md p-8 text-center`} data-reveal>
                    <span className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-turmeric/10 text-clay">
                        <Package size={24} />
                    </span>
                    <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay">Your account</p>
                    <h1 className="mt-3 font-display italic text-3xl leading-none text-ink">Sign in to see your orders.</h1>
                    <p className="mt-3 text-sm leading-relaxed text-ink/55">
                        Order history and tracking live here. Log in with the same email you used at checkout.
                    </p>
                    <button
                        type="button"
                        onClick={openLogin}
                        className="pressable mt-6 w-full rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                    >
                        Log in
                    </button>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
                        <Link href="/track-order" className="text-clay underline underline-offset-4">
                            Track an order as a guest
                        </Link>
                        <Link href="/shop" className="inline-flex items-center gap-1 text-ink/50 transition hover:text-ink">
                            <ArrowLeft size={14} />
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-parchment">
            {/* Hero */}
            <section className="relative overflow-hidden bg-ink text-parchment">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #E4A93D 0%, transparent 45%)' }}
                />
                <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-10 pb-20 md:pt-14 md:pb-24">
                    <Link href="/shop" className="mb-5 inline-flex items-center gap-1.5 text-xs text-parchment/55 transition hover:text-parchment">
                        <ArrowLeft size={14} />
                        Shop
                    </Link>
                    <p className="mb-3 font-label text-[10px] tracking-[0.24em] uppercase text-millet/80">Your account</p>
                    <h1 className="font-display italic text-4xl md:text-5xl leading-[1.05]">Your orders.</h1>
                    <p className="mt-3 text-[15px] text-parchment/65">
                        Signed in as <span className="text-parchment">{user.email}</span>
                        {user.phone ? (
                            <>
                                {' '}
                                ·{' '}
                                <span className="inline-flex items-center gap-1 text-parchment">
                                    <Phone size={13} className="text-parchment/50" />
                                    +91 {user.phone}
                                </span>
                            </>
                        ) : null}
                    </p>
                    {!loading && orders.length ? (
                        <dl className="mt-6 flex flex-wrap gap-2">
                            {[
                                { label: 'Orders', value: stats.total },
                                { label: 'On the way', value: stats.active },
                                { label: 'Delivered', value: stats.delivered },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="flex items-baseline gap-2 rounded-full bg-parchment/10 px-3.5 py-1.5 ring-1 ring-parchment/15"
                                >
                                    <dt className="text-[11px] text-parchment/60">{s.label}</dt>
                                    <dd className="font-display text-base leading-none text-millet">{s.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-5 md:px-8 -mt-12 md:-mt-14 pb-20">
                {loading ? (
                    <div className={`${CARD} flex items-center justify-center gap-2 p-10 text-sm text-ink/50`}>
                        <Loader2 className="animate-spin" size={18} />
                        Loading orders…
                    </div>
                ) : error ? (
                    <div className={`${CARD} p-6 md:p-8`}>
                        <div className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay ring-1 ring-clay/20">{error}</div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className={`${CARD} p-8 text-center md:p-12`} data-reveal>
                        <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-parchment text-ink/40 ring-1 ring-ink/[0.08]">
                            <Package size={26} />
                        </span>
                        <p className="font-display italic text-2xl text-ink md:text-3xl">No orders yet.</p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
                            When you place your first order it shows up here with live tracking.
                        </p>
                        <Link
                            href="/shop"
                            className="pressable mt-6 inline-flex items-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                        >
                            <ShoppingBag size={16} />
                            Shop the range
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {orders.map((order) => {
                            const latestEvent = order.trackingEvents?.length
                                ? order.trackingEvents[order.trackingEvents.length - 1]
                                : null;
                            const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);
                            const trackHref = `/track-order?orderId=${encodeURIComponent(order._id)}`;
                            const detailsHref = `/order-success?orderId=${encodeURIComponent(order._id)}&email=${encodeURIComponent(user.email)}`;
                            const reordered = reorderedId === order._id;

                            return (
                                <li key={order._id} className={`${CARD} overflow-hidden`} data-reveal>
                                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/[0.06] px-5 py-4 md:px-6">
                                        <div className="min-w-0">
                                            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">
                                                Order {displayOrderId(order)}
                                            </p>
                                            <p className="mt-1 text-xs text-ink/45">
                                                Placed {formatDateTime(order.createdAt)} · {paymentMethodLabel(order.paymentMethod)}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_PILL[order.orderStatus]}`}>
                                                {order.orderStatus}
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${
                                                    PAYMENT_PILL[order.paymentStatus] || PAYMENT_PILL.pending
                                                }`}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[1fr_220px] md:p-6">
                                        <div className="min-w-0">
                                            <div className="rounded-2xl bg-parchment/70 p-4 ring-1 ring-ink/[0.06]">
                                                <OrderStatusStepper status={order.orderStatus} />
                                            </div>

                                            <ul className="mt-5 divide-y divide-ink/[0.06]">
                                                {order.items.map((item, i) => (
                                                    <li key={`${item.name}-${i}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-parchment ring-1 ring-ink/[0.06]">
                                                            <Image src={resolveImage(item.image)} alt={item.name} fill className="object-cover" sizes="56px" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                                            <p className="text-xs text-ink/45">
                                                                {formatInr(item.price)} × {item.quantity}
                                                            </p>
                                                        </div>
                                                        <p className="font-display text-base text-ink">{formatInr(item.price * item.quantity)}</p>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-4 space-y-2 border-t border-ink/[0.06] pt-4 text-xs text-ink/60">
                                                <p className="flex items-start gap-2">
                                                    <MapPin size={14} className="mt-0.5 shrink-0 text-ink/30" />
                                                    <span>
                                                        {order.shippingAddress.line1}
                                                        {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''},{' '}
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                                                    </span>
                                                </p>
                                                {order.trackingNumber || order.courierPartner ? (
                                                    <p className="flex items-start gap-2">
                                                        <Truck size={14} className="mt-0.5 shrink-0 text-ink/30" />
                                                        <span>
                                                            {order.courierPartner ? <span className="font-medium text-ink/80">{order.courierPartner}</span> : null}
                                                            {order.courierPartner && order.trackingNumber ? ' · ' : ''}
                                                            {order.trackingNumber ? (
                                                                <span className="font-label break-all">AWB {order.trackingNumber}</span>
                                                            ) : null}
                                                        </span>
                                                    </p>
                                                ) : null}
                                                {latestEvent ? (
                                                    <p className="flex items-start gap-2">
                                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turmeric" />
                                                        <span>
                                                            <span className="font-medium text-ink/80">{latestEvent.title}</span>
                                                            {latestEvent.note ? ` — ${latestEvent.note}` : ''}
                                                            <span className="text-ink/35"> · {formatDateTime(latestEvent.createdAt)}</span>
                                                        </span>
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <aside className="flex flex-col md:border-l md:border-ink/[0.06] md:pl-6">
                                            <dl className="space-y-1.5 text-sm">
                                                <div className="flex justify-between text-ink/60">
                                                    <dt>
                                                        {itemCount} item{itemCount === 1 ? '' : 's'}
                                                    </dt>
                                                    <dd className="text-ink">{formatInr(order.subtotal)}</dd>
                                                </div>
                                                {order.discountAmount > 0 ? (
                                                    <div className="flex justify-between text-basil">
                                                        <dt>Discount{order.couponCode ? ` · ${order.couponCode}` : ''}</dt>
                                                        <dd>-{formatInr(order.discountAmount)}</dd>
                                                    </div>
                                                ) : null}
                                                <div className="flex justify-between text-ink/60">
                                                    <dt>Shipping</dt>
                                                    <dd className={order.shippingCharge === 0 ? 'font-medium text-basil' : 'text-ink'}>
                                                        {order.shippingCharge === 0 ? 'Free' : formatInr(order.shippingCharge)}
                                                    </dd>
                                                </div>
                                                <div className="flex items-baseline justify-between border-t border-ink/[0.08] pt-2.5">
                                                    <dt className="font-semibold text-ink">Total</dt>
                                                    <dd className="font-display text-2xl text-ink">{formatInr(order.totalAmount)}</dd>
                                                </div>
                                            </dl>

                                            <div className="mt-5 space-y-2">
                                                <Link
                                                    href={trackHref}
                                                    className="pressable group flex w-full items-center justify-center gap-2 rounded-full bg-turmeric px-5 py-3 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                                                >
                                                    Track
                                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                                <Link
                                                    href={detailsHref}
                                                    className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-ink/5"
                                                >
                                                    Details &amp; receipt
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReorder(order)}
                                                    className={`flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                                                        reordered ? 'text-basil' : 'text-ink/60 hover:text-ink'
                                                    }`}
                                                >
                                                    {reordered ? <Check size={14} strokeWidth={3} /> : <RotateCcw size={14} />}
                                                    {reordered ? 'Added to cart' : 'Reorder'}
                                                </button>
                                            </div>
                                        </aside>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <p className="mt-10 text-center text-xs text-ink/45">
                    Looking for an order placed as a guest?{' '}
                    <Link href="/track-order" className="text-clay underline underline-offset-4">
                        Track it here
                    </Link>
                </p>
            </div>
        </main>
    );
}
