'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Copy, Mail, MapPin, MessageCircle, Package, Phone, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getGuestOrderApi, getOrderByIdApi } from '@/lib/api/orderApi';
import type { Order } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { displayOrderId, formatDateTime, formatInr, paymentMethodLabel, recallLastOrder } from '@/lib/orderUtils';
import { OrderStatusStepper } from '@/component/order/TrackingTimeline';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { settings } = useSettings();

  const last = recallLastOrder();
  const orderId = searchParams.get('orderId') || last?.orderId || '';
  const email = searchParams.get('email') || last?.email || user?.email || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!orderId) {
        setError('We could not find an order reference.');
        setLoading(false);
        return;
      }
      try {
        let fetched: Order | null = null;
        if (user) {
          try {
            fetched = await getOrderByIdApi(orderId);
          } catch {
            fetched = null;
          }
        }
        if (!fetched && email) {
          fetched = await getGuestOrderApi(orderId, email);
        }
        if (!fetched) throw new Error('not found');
        if (!cancelled) setOrder(fetched);
      } catch {
        if (!cancelled) setError('Your order was placed, but we could not load its details right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, email, user]);

  const trackHref = `/track-order?orderId=${encodeURIComponent(orderId)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
  const supportEmail = settings?.contact?.supportEmail || 'vrateezfoodspvtltd@gmail.com';
  const whatsapp = settings?.contact?.whatsapp;
  const storeDigits = (() => {
    const d = (whatsapp || '916375010189').replace(/\D/g, '');
    return d.length === 10 ? `91${d}` : d;
  })();
  const optInText = `Hi Vrateez! I just placed order ${order ? displayOrderId(order) : `#${orderId.slice(-6).toUpperCase()}`}${
    order?.guestInfo?.name || user?.name ? ` (${order?.guestInfo?.name || user?.name})` : ''
  }. Please send my order updates on this number.`;
  const whatsappOptInHref = `https://wa.me/${storeDigits}?text=${encodeURIComponent(optInText)}`;
  const deliveryDays = settings?.shipping?.deliveryDays || '3 to 7 days';

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order ? displayOrderId(order).replace(/^#/, '') : orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-3 text-ink/50">
        <span className="h-10 w-10 rounded-full border-2 border-turmeric/30 border-t-turmeric animate-spin" />
        <p className="text-sm">Confirming your order…</p>
      </main>
    );
  }

  const paid = order?.paymentStatus === 'paid';
  const isCod = order?.paymentMethod === 'cod';

  return (
    <main className="min-h-screen bg-parchment">
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 30%, #E4A93D 0%, transparent 40%), radial-gradient(ellipse at 85% 70%, #C4711F 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-14 pb-24 md:pt-20 md:pb-28 text-center">
          <span className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-basil text-parchment shadow-[0_0_0_12px_rgba(38,54,42,0.25)] animate-[slideUp_0.5s_ease-out]">
            <Check size={36} strokeWidth={3} />
          </span>
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-3">
            {paid ? 'Payment received' : 'Order confirmed'}
          </p>
          <h1 className="font-display italic text-4xl md:text-6xl leading-[1.02]">
            {paid ? 'Thank you, it’s on its way.' : 'Thank you, your order is in.'}
          </h1>
          <p className="mt-4 text-parchment/65 max-w-xl mx-auto text-[15px] leading-relaxed">
            {isCod
              ? `Keep ${order ? formatInr(order.totalAmount) : 'the amount'} ready for cash on delivery. We are packing it now.`
              : 'We are packing your order now. A confirmation has been sent to your email and WhatsApp.'}
          </p>

          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-parchment/10 ring-1 ring-parchment/15 px-4 py-3 backdrop-blur">
            <span className="text-xs text-parchment/60">Order ID</span>
            <span className="font-label text-base text-parchment">{order ? displayOrderId(order) : `#${orderId.slice(-6).toUpperCase()}`}</span>
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-full bg-parchment/15 px-2.5 py-1 text-[11px] font-semibold text-parchment hover:bg-parchment/25 transition"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <a
              href={whatsappOptInHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition hover:bg-[#1ebe5d]"
            >
              <MessageCircle size={16} />
              Get order updates on WhatsApp
            </a>
            <p className="text-[11px] text-parchment/50">One tap sends us your order number so we can message you packing and shipping updates.</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 md:px-8 -mt-14 md:-mt-16 pb-20">
        {error || !order ? (
          <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)] p-6 md:p-8 text-center">
            <p className="text-ink/70">{error || 'Order details are unavailable.'}</p>
            <p className="mt-2 text-sm text-ink/50">
              Save your order ID. You can look it up any time on the tracking page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={trackHref} className="inline-flex items-center gap-2 rounded-full bg-turmeric px-6 py-3 text-sm font-semibold text-parchment hover:bg-clay transition">
                Track order <ArrowRight size={15} />
              </Link>
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-full ring-1 ring-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5 transition">
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            <div className="space-y-6">
              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)] p-5 md:p-7">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-5">What happens next</p>
                <OrderStatusStepper status={order.orderStatus} />
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Package, title: 'Packed in 24 to 48 hrs', body: 'Baked fresh, sealed and boxed.' },
                    { icon: Truck, title: `Delivered in ${deliveryDays}`, body: 'Tracking number sent on dispatch.' },
                    { icon: MessageCircle, title: 'Updates on WhatsApp', body: 'Every scan, straight to your phone.' },
                  ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-2xl bg-parchment/70 ring-1 ring-ink/[0.06] p-4">
                      <Icon size={16} className="text-clay mb-2" />
                      <p className="text-sm font-semibold text-ink leading-snug">{title}</p>
                      <p className="mt-0.5 text-xs text-ink/55">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-7">
                <h2 className="font-display text-xl text-ink mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-clay" />
                  Your items
                </h2>
                <ul className="divide-y divide-ink/[0.06]">
                  {order.items.map((item, i) => (
                    <li key={`${item.name}-${i}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment ring-1 ring-ink/[0.06]">
                        <Image src={resolveImage(item.image)} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink leading-snug">{item.name}</p>
                        <p className="text-xs text-ink/45 mt-0.5">
                          {formatInr(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-display text-lg text-ink">{formatInr(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
                  <h3 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
                    <MapPin size={17} className="text-clay" />
                    Delivery address
                  </h3>
                  <p className="text-sm text-ink/70 leading-relaxed">
                    {order.guestInfo?.name ? <span className="block font-medium text-ink">{order.guestInfo.name}</span> : null}
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
                  <h3 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
                    <Mail size={17} className="text-clay" />
                    Updates go to
                  </h3>
                  <ul className="space-y-2 text-sm text-ink/70">
                    {(order.guestInfo?.email || email) ? (
                      <li className="flex items-center gap-2">
                        <Mail size={13} className="text-ink/35" /> {order.guestInfo?.email || email}
                      </li>
                    ) : null}
                    {(order.guestInfo?.phone || order.contactPhone) ? (
                      <li className="flex items-center gap-2">
                        <Phone size={13} className="text-ink/35" /> {order.guestInfo?.phone || order.contactPhone}
                      </li>
                    ) : null}
                    <li className="text-xs text-ink/45 pt-1">Placed {formatDateTime(order.createdAt)}</li>
                  </ul>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)] p-5 md:p-6">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay mb-3">Payment summary</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink/60">
                    <dt>Subtotal</dt>
                    <dd>{formatInr(order.subtotal)}</dd>
                  </div>
                  {order.discountAmount > 0 ? (
                    <div className="flex justify-between text-basil">
                      <dt>Discount{order.couponCode ? ` · ${order.couponCode}` : ''}</dt>
                      <dd>-{formatInr(order.discountAmount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-ink/60">
                    <dt>Shipping</dt>
                    <dd className={order.shippingCharge === 0 ? 'text-basil font-medium' : ''}>
                      {order.shippingCharge === 0 ? 'Free' : formatInr(order.shippingCharge)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-ink/[0.08] pt-3">
                    <dt className="font-semibold text-ink">{isCod ? 'Pay on delivery' : 'Total paid'}</dt>
                    <dd className="font-display text-2xl text-ink">{formatInr(order.totalAmount)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-parchment/70 px-3.5 py-2.5 text-xs">
                  <span className="text-ink/60">{paymentMethodLabel(order.paymentMethod)}</span>
                  <span
                    className={`font-semibold capitalize ${
                      paid ? 'text-basil' : order.paymentStatus === 'failed' ? 'text-clay' : 'text-turmeric'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  <Link
                    href={trackHref}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
                  >
                    Track this order
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  {user ? (
                    <Link
                      href="/account/orders"
                      className="flex w-full items-center justify-center gap-2 rounded-full ring-1 ring-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
                    >
                      All my orders
                    </Link>
                  ) : null}
                  <Link
                    href="/shop"
                    className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-ink/60 transition hover:text-ink"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>

              <div className="rounded-[22px] bg-ink text-parchment p-5 md:p-6">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-2">Questions?</p>
                <p className="text-sm text-parchment/70 leading-relaxed">Reply to the confirmation email or message us. Quote your order ID.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Order ${displayOrderId(order)}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-parchment/10 px-3.5 py-2 text-xs font-semibold text-parchment ring-1 ring-parchment/15 hover:bg-parchment/20"
                  >
                    <Mail size={13} /> {supportEmail}
                  </a>
                  {whatsapp ? (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, about my order ${displayOrderId(order)}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-millet px-3.5 py-2 text-xs font-semibold text-ink hover:bg-parchment"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-parchment flex items-center justify-center text-ink/50 text-sm">Loading…</main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
