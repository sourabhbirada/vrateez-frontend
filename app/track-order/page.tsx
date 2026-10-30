'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, Hash, Loader2, Mail, MapPin, Package, Search, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  getGuestOrderApi,
  getOrderByIdApi,
  getOrderByOrderIdApi,
  getOrderByTrackingNumberApi,
  getOrderTrackingApi,
} from '@/lib/api/orderApi';
import type { LiveTracking, Order } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { displayOrderId, formatDateTime, formatInr, isObjectId, paymentMethodLabel, recallLastOrder } from '@/lib/orderUtils';
import TrackingTimeline from '@/component/order/TrackingTimeline';

type Mode = 'orderId' | 'trackingNumber';

const inputCls =
  'w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:border-turmeric focus:ring-2 focus:ring-turmeric/30 disabled:bg-ink/[0.04] disabled:text-ink/50';

const STATUS_PILL: Record<Order['orderStatus'], string> = {
  placed: 'bg-ink/5 text-ink/70',
  processing: 'bg-turmeric/10 text-clay',
  shipped: 'bg-millet/20 text-clay',
  delivered: 'bg-basil/10 text-basil',
  cancelled: 'bg-clay/10 text-clay',
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [mode, setMode] = useState<Mode>('orderId');
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<LiveTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const autoRan = useRef(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const lookup = useCallback(
    async (lookupMode: Mode, lookupValue: string, lookupEmail: string) => {
      const q = lookupValue.trim().replace(/^#/, '');
      const em = lookupEmail.trim();
      setError(null);

      if (!q) {
        setError(lookupMode === 'orderId' ? 'Enter your order ID.' : 'Enter the tracking number.');
        return;
      }
      if (!user && (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))) {
        setError('Enter the email you used at checkout.');
        return;
      }

      setLoading(true);
      setOrder(null);
      setTracking(null);
      setTrackingError(null);

      try {
        let found: Order;
        const guestEmail = user ? undefined : em;

        if (lookupMode === 'trackingNumber') {
          found = await getOrderByTrackingNumberApi(q, guestEmail);
        } else {
          try {
            found = await getOrderByOrderIdApi(q, guestEmail);
          } catch (primaryErr) {
            if (isObjectId(q)) {
              found = user ? await getOrderByIdApi(q) : await getGuestOrderApi(q, em);
            } else {
              throw primaryErr;
            }
          }
        }

        setOrder(found);

        if (found.trackingNumber) {
          setTrackingLoading(true);
          try {
            const res = await getOrderTrackingApi(found._id);
            if (res.hasTracking && res.tracking) {
              setTracking(res.tracking);
            } else {
              setTrackingError(res.message || 'Live courier updates are not available yet.');
            }
          } catch {
            setTrackingError('Live courier updates are not available right now.');
          } finally {
            setTrackingLoading(false);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'We could not find that order. Check the ID and email and try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Prefill from links in emails / WhatsApp, or from the order just placed.
  useEffect(() => {
    if (autoRan.current) return;
    const tn = searchParams.get('trackingNumber') || searchParams.get('tracking');
    const oid = searchParams.get('orderId') || searchParams.get('id');
    const em = searchParams.get('email');
    const last = !tn && !oid ? recallLastOrder() : null;

    const nextMode: Mode = tn ? 'trackingNumber' : 'orderId';
    const nextValue = tn || oid || last?.orderId || '';
    const nextEmail = em || last?.email || user?.email || '';

    if (!nextValue) return;
    autoRan.current = true;
    setMode(nextMode);
    setValue(nextValue);
    if (nextEmail) setEmail(nextEmail);
    if (user || nextEmail) void lookup(nextMode, nextValue, nextEmail);
  }, [searchParams, user, lookup]);

  const supportEmail = settings?.contact?.supportEmail || 'vrateezfoodspvtltd@gmail.com';
  const whatsapp = settings?.contact?.whatsapp;

  return (
    <main className="min-h-screen bg-parchment">
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #E4A93D 0%, transparent 45%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-12 pb-20 md:pt-16 md:pb-24">
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-3">Order tracking</p>
          <h1 className="font-display italic text-4xl md:text-5xl leading-[1.05]">Where is my order?</h1>
          <p className="mt-3 text-parchment/65 max-w-lg text-[15px]">
            Enter your order ID or courier tracking number. Live scan updates come straight from the courier.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 md:px-8 -mt-12 md:-mt-14 pb-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(mode, value, email);
          }}
          className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.5)] p-5 md:p-7"
        >
          <div className="inline-flex rounded-full bg-ink/[0.05] p-1 mb-5">
            {(
              [
                { id: 'orderId', label: 'Order ID', icon: Hash },
                { id: 'trackingNumber', label: 'Tracking number', icon: Truck },
              ] as Array<{ id: Mode; label: string; icon: typeof Hash }>
            ).map((opt) => {
              const Icon = opt.icon;
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active ? 'bg-ink text-parchment shadow' : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  <Icon size={13} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="block font-label text-[10px] tracking-[0.16em] uppercase text-ink/50 mb-1.5">
                {mode === 'orderId' ? 'Order ID' : 'Tracking number'}
              </span>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={mode === 'orderId' ? 'e.g. #A1B2C3 or VRZ-1024' : 'e.g. SF3583515448'}
                  className={`${inputCls} pl-11`}
                  autoComplete="off"
                />
              </div>
            </label>
            <label className="block">
              <span className="block font-label text-[10px] tracking-[0.16em] uppercase text-ink/50 mb-1.5">Email</span>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputCls} pl-11`}
                  disabled={Boolean(user)}
                  autoComplete="email"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-turmeric px-6 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Looking up' : 'Track'}
            </button>
          </div>

          <p className="mt-3 text-xs text-ink/45">
            {user
              ? 'Signed in: we match orders to your account automatically.'
              : 'Your order ID is in the confirmation email and on the order success page.'}
          </p>

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-clay/10 ring-1 ring-clay/20 px-4 py-3 text-sm text-clay">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
        </form>

        {order ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            <div className="space-y-6">
              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-ink/45">Order</p>
                  <p className="font-display text-2xl text-ink leading-tight mt-1">{displayOrderId(order)}</p>
                  <p className="text-xs text-ink/45 mt-1">Placed {formatDateTime(order.createdAt)}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_PILL[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
              </div>

              <TrackingTimeline order={order} tracking={tracking} trackingLoading={trackingLoading} trackingError={trackingError} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
                <h3 className="font-display text-lg text-ink mb-4 flex items-center gap-2">
                  <Package size={18} className="text-clay" />
                  Items
                </h3>
                <ul className="space-y-3">
                  {order.items.map((item, i) => (
                    <li key={`${item.name}-${i}`} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-parchment ring-1 ring-ink/[0.06]">
                        <Image src={resolveImage(item.image)} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink/45">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatInr(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-5 space-y-1.5 border-t border-ink/[0.08] pt-4 text-sm">
                  <div className="flex justify-between text-ink/60">
                    <dt>Subtotal</dt>
                    <dd>{formatInr(order.subtotal)}</dd>
                  </div>
                  {order.discountAmount > 0 ? (
                    <div className="flex justify-between text-basil">
                      <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                      <dd>-{formatInr(order.discountAmount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-ink/60">
                    <dt>Shipping</dt>
                    <dd className={order.shippingCharge === 0 ? 'text-basil font-medium' : ''}>
                      {order.shippingCharge === 0 ? 'Free' : formatInr(order.shippingCharge)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-ink/[0.08] pt-2 font-display text-lg text-ink">
                    <dt>Total</dt>
                    <dd>{formatInr(order.totalAmount)}</dd>
                  </div>
                  <div className="flex justify-between text-xs text-ink/50 pt-1">
                    <dt>{paymentMethodLabel(order.paymentMethod)}</dt>
                    <dd className="capitalize">{order.paymentStatus}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
                <h3 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-clay" />
                  Delivering to
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed">
                  {order.guestInfo?.name ? <span className="block font-medium text-ink">{order.guestInfo.name}</span> : null}
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
              </div>

              <div className="rounded-[22px] bg-ink text-parchment p-5 md:p-6">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-millet/80 mb-2">Need help?</p>
                <p className="text-sm text-parchment/70 leading-relaxed">
                  Quote order {displayOrderId(order)} and we will sort it out.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Order ${displayOrderId(order)}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-parchment/10 px-3.5 py-2 text-xs font-semibold text-parchment ring-1 ring-parchment/15 hover:bg-parchment/20"
                  >
                    <Mail size={13} /> Email support
                  </a>
                  {whatsapp ? (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I need help with order ${displayOrderId(order)}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-millet px-3.5 py-2 text-xs font-semibold text-ink hover:bg-parchment"
                    >
                      WhatsApp us <ArrowRight size={13} />
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        ) : !loading ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Package, title: 'Packed fresh', body: 'Orders are baked and packed within 24 to 48 hours of confirmation.' },
              { icon: Truck, title: 'Shipped pan-India', body: `Typical delivery in ${settings?.shipping?.deliveryDays || '3 to 7 days'} depending on your pincode.` },
              { icon: Mail, title: 'Updates on WhatsApp', body: 'You get the tracking number the moment the courier picks it up.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[22px] bg-white/70 ring-1 ring-ink/[0.06] p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-turmeric/10 text-clay mb-3">
                  <Icon size={16} />
                </span>
                <p className="font-semibold text-ink text-sm">{title}</p>
                <p className="mt-1 text-xs text-ink/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-ink/45">
          Can&apos;t find your order?{' '}
          <a href={`mailto:${supportEmail}`} className="text-clay underline underline-offset-4">
            {supportEmail}
          </a>{' '}
          ·{' '}
          <Link href="/shop" className="text-clay underline underline-offset-4">
            Back to shop
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-parchment flex items-center justify-center text-ink/50 text-sm">Loading tracker…</main>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
