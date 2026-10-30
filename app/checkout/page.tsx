'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Tag,
  Truck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { createOrderApi, createGuestOrderApi, confirmGuestCodOrderApi } from '@/lib/api/orderApi';
import {
  createPaymentIntentApi,
  verifyPaymentApi,
  confirmCodOrderApi,
  createGuestPaymentApi,
  verifyGuestPaymentApi,
} from '@/lib/api/paymentApi';
import { validateCouponApi } from '@/lib/api/couponApi';
import { getProductsApi } from '@/lib/api/productApi';
import { isPaymentCancelledError, openRazorpayCheckout } from '@/lib/razorpay';
import type { ShippingAddress, GuestInfo, Order } from '@/lib/api/types';
import { resolveImage } from '@/lib/images';
import { formatInr, isObjectId, rememberLastOrder } from '@/lib/orderUtils';

type PaymentMode = 'online' | 'cod';
type FieldKey = 'name' | 'email' | 'phone' | 'line1' | 'city' | 'state' | 'pincode';

const ADDRESS_KEY = 'vrateez_checkout_address';

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function digitsOnlyPhone(value: string): string {
  const d = value.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('91')) return d.slice(-10);
  if (d.length >= 10) return d.slice(-10);
  return d;
}

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:ring-2 focus:ring-turmeric/30 focus:border-turmeric';

function Field({
  label,
  error,
  hint,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block font-label text-[10px] tracking-[0.16em] uppercase text-ink/55">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-clay">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink/40">{hint}</span>
      ) : null}
    </label>
  );
}

function SectionCard({
  step,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  icon: typeof MapPin;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_18px_50px_-36px_rgba(36,31,22,0.5)] overflow-hidden">
      <header className="flex items-center gap-3 border-b border-ink/[0.06] px-5 md:px-6 py-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-parchment font-label text-[11px]">
          {String(step).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg text-ink leading-tight">{title}</h2>
          {subtitle ? <p className="text-xs text-ink/45 mt-0.5">{subtitle}</p> : null}
        </div>
        <Icon size={18} className="ml-auto text-ink/25" />
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, openCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const orderPlacedRef = useRef(false);

  // --- form state -----------------------------------------------------------
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: '', email: '', phone: '' });
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('online');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinLookup, setPinLookup] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const cityTouched = useRef(false);

  // coupon
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponCode: string; discountAmount: number; description: string } | null>(null);

  // --- derived --------------------------------------------------------------
  const subtotal = totalPrice;
  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const standardShippingFee = settings?.shipping?.standardShippingFee ?? 49;
  const hasFreeDeliveryProduct = items.some((item) => item.freeDelivery === true);
  const shippingCharge = subtotal >= freeShippingThreshold || hasFreeDeliveryProduct ? 0 : standardShippingFee;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(subtotal - discountAmount + shippingCharge, 0);
  const remainingForFree = Math.max(freeShippingThreshold - subtotal, 0);
  const freeProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const codEnabled = settings?.shipping?.paymentMethods?.cod ?? true;
  const deliveryDays = settings?.shipping?.deliveryDays || '3 to 7 days';

  // --- effects --------------------------------------------------------------
  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      router.replace('/shop');
    }
  }, [items.length, router]);

  useEffect(() => {
    if (user?.phone) setContactPhone(user.phone);
  }, [user?.phone]);

  useEffect(() => {
    if (!codEnabled) setPaymentMode('online');
  }, [codEnabled]);

  // restore the last used address
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<ShippingAddress & GuestInfo>;
      setAddress((a) => ({
        ...a,
        line1: saved.line1 || '',
        line2: saved.line2 || '',
        city: saved.city || '',
        state: saved.state || '',
        pincode: saved.pincode || '',
      }));
      setGuestInfo((g) => ({ ...g, name: saved.name || '', email: saved.email || '', phone: saved.phone || '' }));
      if (saved.city) cityTouched.current = true;
    } catch {
      /* ignore */
    }
  }, []);

  // auto-fill city/state from pincode
  useEffect(() => {
    const pin = address.pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPinLookup('idle');
      return;
    }
    let cancelled = false;
    setPinLookup('loading');
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = (await res.json()) as Array<{ Status: string; PostOffice?: Array<{ District: string; State: string }> }>;
        const po = data?.[0]?.Status === 'Success' ? data[0].PostOffice?.[0] : undefined;
        if (cancelled) return;
        if (po) {
          setAddress((a) => ({
            ...a,
            city: cityTouched.current && a.city ? a.city : po.District,
            state: po.State,
          }));
          setFieldErrors((e) => ({ ...e, pincode: undefined, city: undefined, state: undefined }));
          setPinLookup('done');
        } else {
          setPinLookup('error');
        }
      } catch {
        if (!cancelled) setPinLookup('error');
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [address.pincode]);

  const clearFieldError = (key: FieldKey) => setFieldErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  // --- coupon ---------------------------------------------------------------
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setError(null);
    setIsApplyingCoupon(true);
    try {
      const result = await validateCouponApi({ couponCode: couponInput.trim(), subtotal, shippingCharge });
      setAppliedCoupon(result);
      setCouponInput(result.couponCode);
    } catch (err) {
      setAppliedCoupon(null);
      setError(err instanceof Error ? err.message : 'That coupon could not be applied.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // --- validation -----------------------------------------------------------
  const validate = (): boolean => {
    const errs: Partial<Record<FieldKey, string>> = {};
    if (!user) {
      if (!guestInfo.name.trim()) errs.name = 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email.trim())) errs.email = 'Enter a valid email address.';
      if (digitsOnlyPhone(guestInfo.phone).length !== 10) errs.phone = 'Enter a 10-digit mobile number.';
    } else if (digitsOnlyPhone(contactPhone).length !== 10) {
      errs.phone = 'Enter a 10-digit mobile number for delivery updates.';
    }
    if (!address.line1.trim()) errs.line1 = 'Please enter your address.';
    if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode.';
    if (!address.city.trim()) errs.city = 'Please enter your city.';
    if (!address.state.trim()) errs.state = 'Please enter your state.';

    setFieldErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const resolveGuestOrderItems = useCallback(async () => {
    if (items.every((item) => isObjectId(item.id))) {
      return items.map((item) => ({ productId: item.id, quantity: item.quantity }));
    }
    const response = await getProductsApi({ limit: 100 });
    const apiProducts = response.items;
    if (!apiProducts.length) throw new Error('Product catalogue is temporarily unavailable. Please try again in a moment.');
    const bySlug = new Map(apiProducts.map((p) => [p.slug, p]));
    return items.map((item) => {
      if (isObjectId(item.id)) return { productId: item.id, quantity: item.quantity };
      let match = item.slug ? bySlug.get(item.slug) : undefined;
      if (!match) {
        const n = normalizeText(item.name);
        const exact = apiProducts.filter((p) => normalizeText(p.name) === n);
        match = exact.find((p) => p.price === item.price) || exact[0];
      }
      if (!match) throw new Error(`"${item.name}" is no longer available. Please remove it from your cart.`);
      return { productId: match._id, quantity: item.quantity };
    });
  }, [items]);

  const finish = (order: Order, emailForLookup: string) => {
    try {
      localStorage.setItem(
        ADDRESS_KEY,
        JSON.stringify({ ...address, name: guestInfo.name, email: guestInfo.email, phone: guestInfo.phone }),
      );
    } catch {
      /* ignore */
    }
    rememberLastOrder(order._id, emailForLookup);
    orderPlacedRef.current = true;
    clearCart();
    router.replace(`/order-success?orderId=${order._id}&email=${encodeURIComponent(emailForLookup)}`);
  };

  // --- place order ----------------------------------------------------------
  const handlePlaceOrder = async () => {
    setError(null);
    setInfo(null);
    if (!validate()) return;

    setIsLoading(true);
    const emailForLookup = user?.email || guestInfo.email.trim();
    const phone = user ? digitsOnlyPhone(contactPhone) : digitsOnlyPhone(guestInfo.phone);

    try {
      let order: Order;
      const paymentMethod = paymentMode === 'cod' ? 'cod' : 'razorpay';

      if (user) {
        order = await createOrderApi({
          shippingAddress: address,
          paymentMethod,
          couponCode: appliedCoupon?.couponCode,
          contactPhone: phone,
          notes: notes.trim() || undefined,
        });
      } else {
        const guestItems = await resolveGuestOrderItems();
        order = await createGuestOrderApi({
          items: guestItems,
          shippingAddress: address,
          paymentMethod,
          guestInfo: { ...guestInfo, phone, email: guestInfo.email.trim(), name: guestInfo.name.trim() },
          couponCode: appliedCoupon?.couponCode,
          notes: notes.trim() || undefined,
        });
      }

      if (paymentMode === 'cod') {
        if (user) await confirmCodOrderApi(order._id);
        else await confirmGuestCodOrderApi(order._id, guestInfo.email.trim());
        finish(order, emailForLookup);
        return;
      }

      const intent = user
        ? await createPaymentIntentApi(order._id, 'razorpay')
        : await createGuestPaymentApi(order._id, guestInfo.email.trim(), 'razorpay');

      if (!(intent.provider === 'razorpay' && intent.razorpayOrderId && intent.razorpayKeyId)) {
        throw new Error('Online payment is unavailable right now. Please choose Cash on Delivery.');
      }

      const response = await openRazorpayCheckout({
        key: intent.razorpayKeyId,
        amount: intent.amount,
        currency: intent.currency,
        name: 'Vrateez',
        description: `Order #${order._id.slice(-6).toUpperCase()}`,
        order_id: intent.razorpayOrderId,
        prefill: { name: user?.name || guestInfo.name, email: emailForLookup, contact: phone },
        theme: { color: '#C4711F' },
        handler: () => {},
      });

      try {
        const payload = {
          orderId: order._id,
          provider: 'razorpay' as const,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        };
        if (user) await verifyPaymentApi(payload);
        else await verifyGuestPaymentApi({ ...payload, email: guestInfo.email.trim() });
      } catch (verifyErr) {
        const msg = verifyErr instanceof Error ? verifyErr.message : 'Payment could not be verified.';
        const qs = new URLSearchParams({ orderId: order._id, message: msg });
        if (!user) qs.set('email', guestInfo.email.trim());
        orderPlacedRef.current = true;
        router.replace(`/order-payment-error?${qs.toString()}`);
        return;
      }

      finish(order, emailForLookup);
    } catch (err) {
      if (isPaymentCancelledError(err)) {
        setInfo('Payment window closed before completing. Nothing was charged. Pay again when ready, or switch to Cash on Delivery.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="font-display text-2xl text-ink">Your cart is empty</p>
        <Link href="/shop" className="rounded-full bg-turmeric px-6 py-3 text-sm font-semibold text-parchment hover:bg-clay transition">
          Browse the shop
        </Link>
      </main>
    );
  }

  const ctaLabel = paymentMode === 'cod' ? `Place order · ${formatInr(total)}` : `Pay ${formatInr(total)} securely`;

  return (
    <main className="min-h-screen bg-parchment pb-28 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink/50 transition hover:text-ink"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="font-display italic text-4xl md:text-5xl text-ink leading-none">Checkout</h1>
            <p className="mt-2 text-sm text-ink/55">
              {itemCount} item{itemCount === 1 ? '' : 's'} · delivery in {deliveryDays}
            </p>
          </div>
          <ol className="flex items-center gap-2 text-[11px] font-label uppercase tracking-[0.14em]">
            {['Cart', 'Details', 'Payment', 'Done'].map((label, i) => {
              const state = i === 0 ? 'done' : i === 1 || i === 2 ? 'active' : 'todo';
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      state === 'done'
                        ? 'bg-basil text-parchment'
                        : state === 'active'
                          ? 'bg-ink text-parchment'
                          : 'bg-ink/10 text-ink/40'
                    }`}
                  >
                    {state === 'done' ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={state === 'todo' ? 'text-ink/35' : 'text-ink'}>{label}</span>
                  {i < 3 ? <span className="mx-1 h-px w-5 bg-ink/15" /> : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">
          {/* Left column */}
          <div className="space-y-5">
            <SectionCard step={1} title="Contact" subtitle="For order confirmation and delivery updates" icon={UserIcon}>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-parchment/70 px-4 py-3 ring-1 ring-ink/[0.06]">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-parchment text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                      <p className="text-xs text-ink/50 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div id="field-phone">
                    <Field label="Mobile number" error={fieldErrors.phone} hint="WhatsApp updates and courier calls go here.">
                      <div className="relative">
                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={contactPhone}
                          onChange={(e) => {
                            setContactPhone(e.target.value);
                            clearFieldError('phone');
                          }}
                          placeholder="98765 43210"
                          className={`${inputBase} pl-11 ${fieldErrors.phone ? 'border-clay/60' : 'border-ink/12'}`}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-name" className="md:col-span-2">
                    <Field label="Full name" error={fieldErrors.name}>
                      <input
                        type="text"
                        autoComplete="name"
                        value={guestInfo.name}
                        onChange={(e) => {
                          setGuestInfo({ ...guestInfo, name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Your full name"
                        className={`${inputBase} ${fieldErrors.name ? 'border-clay/60' : 'border-ink/12'}`}
                      />
                    </Field>
                  </div>
                  <div id="field-email">
                    <Field label="Email" error={fieldErrors.email}>
                      <input
                        type="email"
                        autoComplete="email"
                        value={guestInfo.email}
                        onChange={(e) => {
                          setGuestInfo({ ...guestInfo, email: e.target.value });
                          clearFieldError('email');
                        }}
                        placeholder="you@email.com"
                        className={`${inputBase} ${fieldErrors.email ? 'border-clay/60' : 'border-ink/12'}`}
                      />
                    </Field>
                  </div>
                  <div id="field-phone">
                    <Field label="Mobile number" error={fieldErrors.phone}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink/40">+91</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={guestInfo.phone}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, phone: e.target.value });
                            clearFieldError('phone');
                          }}
                          placeholder="98765 43210"
                          className={`${inputBase} pl-12 ${fieldErrors.phone ? 'border-clay/60' : 'border-ink/12'}`}
                        />
                      </div>
                    </Field>
                  </div>
                  <p className="md:col-span-2 text-xs text-ink/45">
                    Already have an account? Sign in from the account icon to skip this step next time.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard step={2} title="Delivery address" subtitle="Pan-India shipping · pincode fills city and state" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div id="field-line1" className="md:col-span-6">
                  <Field label="Address" error={fieldErrors.line1}>
                    <input
                      type="text"
                      autoComplete="address-line1"
                      value={address.line1}
                      onChange={(e) => {
                        setAddress({ ...address, line1: e.target.value });
                        clearFieldError('line1');
                      }}
                      placeholder="Flat / house no., building, street"
                      className={`${inputBase} ${fieldErrors.line1 ? 'border-clay/60' : 'border-ink/12'}`}
                    />
                  </Field>
                </div>
                <div className="md:col-span-6">
                  <Field label="Area / landmark (optional)">
                    <input
                      type="text"
                      autoComplete="address-line2"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      placeholder="Area, landmark"
                      className={`${inputBase} border-ink/12`}
                    />
                  </Field>
                </div>
                <div id="field-pincode" className="md:col-span-2">
                  <Field
                    label="Pincode"
                    error={fieldErrors.pincode}
                    hint={pinLookup === 'loading' ? 'Looking up…' : pinLookup === 'done' ? 'City and state filled' : pinLookup === 'error' ? 'Enter city and state manually' : undefined}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => {
                        setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) });
                        clearFieldError('pincode');
                      }}
                      placeholder="400001"
                      className={`${inputBase} ${fieldErrors.pincode ? 'border-clay/60' : 'border-ink/12'}`}
                    />
                  </Field>
                </div>
                <div id="field-city" className="md:col-span-2">
                  <Field label="City" error={fieldErrors.city}>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={(e) => {
                        cityTouched.current = true;
                        setAddress({ ...address, city: e.target.value });
                        clearFieldError('city');
                      }}
                      placeholder="Mumbai"
                      className={`${inputBase} ${fieldErrors.city ? 'border-clay/60' : 'border-ink/12'}`}
                    />
                  </Field>
                </div>
                <div id="field-state" className="md:col-span-2">
                  <Field label="State" error={fieldErrors.state}>
                    <input
                      type="text"
                      autoComplete="address-level1"
                      value={address.state}
                      onChange={(e) => {
                        setAddress({ ...address, state: e.target.value });
                        clearFieldError('state');
                      }}
                      placeholder="Maharashtra"
                      className={`${inputBase} ${fieldErrors.state ? 'border-clay/60' : 'border-ink/12'}`}
                    />
                  </Field>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-clay hover:text-ink transition"
              >
                <ChevronDown size={14} className={`transition-transform ${showNotes ? 'rotate-180' : ''}`} />
                {showNotes ? 'Hide delivery note' : 'Add a delivery note'}
              </button>
              {showNotes ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Gate code, preferred time, gift message…"
                  className={`${inputBase} border-ink/12 mt-3 resize-none`}
                />
              ) : null}
            </SectionCard>

            <SectionCard step={3} title="Payment" subtitle="All payments are encrypted and processed by Razorpay" icon={CreditCard}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      id: 'online' as PaymentMode,
                      label: 'Pay online',
                      sub: 'UPI · Cards · Net banking · Wallets',
                      icon: CreditCard,
                      badge: 'Recommended',
                      enabled: true,
                    },
                    {
                      id: 'cod' as PaymentMode,
                      label: 'Cash on Delivery',
                      sub: `Pay ${formatInr(total)} when it arrives`,
                      icon: Banknote,
                      badge: codEnabled ? undefined : 'Unavailable',
                      enabled: codEnabled,
                    },
                  ]
                ).map((opt) => {
                  const Icon = opt.icon;
                  const selected = paymentMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!opt.enabled}
                      onClick={() => setPaymentMode(opt.id)}
                      className={`relative flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition disabled:opacity-50 ${
                        selected ? 'bg-turmeric/[0.07] ring-turmeric shadow-[0_0_0_3px_rgba(196,113,31,0.12)]' : 'bg-parchment/50 ring-ink/10 hover:ring-ink/25'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          selected ? 'bg-turmeric text-parchment' : 'bg-white text-ink/50 ring-1 ring-ink/10'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                        <span className="block text-xs text-ink/50 mt-0.5">{opt.sub}</span>
                      </span>
                      {opt.badge ? (
                        <span className="absolute top-3 right-3 rounded-full bg-ink text-parchment px-2 py-0.5 font-label text-[9px] tracking-[0.12em] uppercase">
                          {opt.badge}
                        </span>
                      ) : null}
                      {selected ? (
                        <span className="absolute bottom-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-turmeric text-parchment">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-ink/45">
                <Lock size={12} />
                {paymentMode === 'online'
                  ? 'You will be taken to Razorpay’s secure window. We never see your card or UPI details.'
                  : 'Please keep exact change ready. COD orders are confirmed on WhatsApp before dispatch.'}
              </p>
            </SectionCard>
          </div>

          {/* Right column: summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-40px_rgba(36,31,22,0.55)] overflow-hidden">
              <div className="flex items-center justify-between bg-ink px-5 py-4 text-parchment">
                <div>
                  <h2 className="font-display text-lg leading-tight">Order summary</h2>
                  <p className="text-xs text-parchment/55 mt-0.5">
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                </div>
                <button type="button" onClick={openCart} className="text-xs font-semibold text-millet hover:text-parchment transition">
                  Edit cart
                </button>
              </div>

              <div className="p-5">
                <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-parchment ring-1 ring-ink/[0.06]">
                        <Image src={resolveImage(item.image)} alt={item.name} fill className="object-cover" sizes="56px" />
                        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-parchment">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink/45">
                          {item.weight}
                          {item.freeDelivery ? <span className="ml-2 text-basil font-semibold">Free delivery</span> : null}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatInr(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>

                {/* free shipping progress */}
                {!hasFreeDeliveryProduct ? (
                  <div className="mt-5 rounded-xl bg-parchment/70 px-3.5 py-3 ring-1 ring-ink/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-ink/70">
                        <Truck size={13} className="text-clay" />
                        {remainingForFree > 0 ? `Add ${formatInr(remainingForFree)} for free shipping` : 'Free shipping unlocked'}
                      </span>
                      <span className="font-label text-[10px] text-ink/45">{freeProgress}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-basil transition-all" style={{ width: `${freeProgress}%` }} />
                    </div>
                  </div>
                ) : null}

                {/* coupon */}
                <div className="mt-5">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-basil/10 px-3.5 py-2.5 ring-1 ring-basil/20 text-sm">
                      <span className="inline-flex items-center gap-2 text-basil font-medium">
                        <Tag size={14} />
                        {appliedCoupon.couponCode}
                        {appliedCoupon.description ? <span className="text-basil/70 text-xs">· {appliedCoupon.description}</span> : null}
                      </span>
                      <button type="button" onClick={() => setAppliedCoupon(null)} aria-label="Remove coupon" className="text-basil hover:text-ink">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleApplyCoupon();
                            }
                          }}
                          placeholder="Coupon code"
                          className={`${inputBase} border-ink/12 pl-10 py-2.5`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="rounded-xl bg-ink px-4 text-sm font-semibold text-parchment transition hover:bg-basil disabled:opacity-40"
                      >
                        {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                <dl className="mt-5 space-y-2 border-t border-ink/[0.08] pt-4 text-sm">
                  <div className="flex justify-between text-ink/60">
                    <dt>Subtotal</dt>
                    <dd className="text-ink">{formatInr(subtotal)}</dd>
                  </div>
                  {discountAmount > 0 ? (
                    <div className="flex justify-between text-basil">
                      <dt>Discount</dt>
                      <dd>-{formatInr(discountAmount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-ink/60">
                    <dt>Shipping</dt>
                    <dd className={shippingCharge === 0 ? 'text-basil font-medium' : 'text-ink'}>
                      {shippingCharge === 0 ? 'Free' : formatInr(shippingCharge)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-ink/[0.08] pt-3">
                    <dt className="font-semibold text-ink">Total</dt>
                    <dd className="font-display text-2xl text-ink">{formatInr(total)}</dd>
                  </div>
                  <p className="text-[11px] text-ink/40">Inclusive of all taxes.</p>
                </dl>

                {info ? <div className="mt-4 rounded-xl bg-ink/5 px-3.5 py-3 text-sm text-ink/80 ring-1 ring-ink/10">{info}</div> : null}
                {error ? <div className="mt-4 rounded-xl bg-clay/10 px-3.5 py-3 text-sm text-clay ring-1 ring-clay/20">{error}</div> : null}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="group mt-5 hidden w-full items-center justify-center gap-2 rounded-full bg-turmeric py-4 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                  {isLoading ? 'Processing…' : ctaLabel}
                  {!isLoading ? <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /> : null}
                </button>

                <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: ShieldCheck, label: 'FSSAI certified' },
                    { icon: Lock, label: 'Secure payment' },
                    { icon: Truck, label: 'Pan-India delivery' },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="rounded-xl bg-parchment/60 px-2 py-2.5">
                      <Icon size={14} className="mx-auto text-clay" />
                      <p className="mt-1 text-[10px] font-medium text-ink/60 leading-tight">{label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-parchment/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-label uppercase tracking-[0.14em] text-ink/45">Total</p>
            <p className="font-display text-xl text-ink leading-none">{formatInr(total)}</p>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
            {isLoading ? 'Processing…' : paymentMode === 'cod' ? 'Place order' : 'Pay now'}
          </button>
        </div>
      </div>
    </main>
  );
}
