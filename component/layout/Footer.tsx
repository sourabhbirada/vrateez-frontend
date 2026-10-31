'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  MessageCircle,
  Check,
} from 'lucide-react';
import { getCategoriesApi } from '@/lib/api/categoryApi';
import { useSettings, whatsappLink } from '@/context/SettingsContext';
import type { Category } from '@/lib/api/types';

const DEFAULT_CATEGORIES = [
  { label: 'Cookies', href: '/shop?category=cookies' },
  { label: 'Infused Cookies', href: '/shop?category=infused-cookie' },
  { label: 'Energy on the Go', href: '/shop?category=energy-on-the-go' },
  { label: 'Savory Snacks', href: '/shop?category=savory-snacks' },
  { label: 'Wholesome Delights', href: '/shop?category=wholesome-delights' },
];

const COMPANY_LINKS = [
  { href: '/about-us', label: 'About Us' },
  { href: '/bulk-order', label: 'Bulk Orders' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/faq', label: 'FAQ' },
  { href: '/diwali', label: 'Diwali Offers' },
];

const WHY_VRATEEZ = [
  'Vrat friendly snacks',
  'Zero added sugar',
  'Millet-based nutrition',
  'No palm oil, no maida',
  'FSSAI certified kitchen',
];

const BOTTOM_LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/track-order', label: 'Track order' },
  { href: '/bulk-order', label: 'Bulk order' },
];

const FALLBACK_WHATSAPP = '916375010189';
const OPT_IN_MESSAGE = 'Hi Vrateez! Please add me to your WhatsApp list for new launches and festival offers.';

export default function Footer() {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCategoriesApi()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contact = settings?.contact;
  const social = settings?.socialMedia;
  const phone = contact?.phone || '+91-70700 88100';
  const email = contact?.supportEmail || 'support@vrateez.com';
  const address = contact?.address || 'Jaipur, Rajasthan, India';
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;
  const emailHref = `mailto:${email}`;
  const whatsappHref =
    whatsappLink(contact?.whatsapp, OPT_IN_MESSAGE) ||
    whatsappLink(FALLBACK_WHATSAPP, OPT_IN_MESSAGE) ||
    `https://wa.me/${FALLBACK_WHATSAPP}`;
  const whatsappChatHref =
    whatsappLink(contact?.whatsapp) || whatsappLink(FALLBACK_WHATSAPP) || `https://wa.me/${FALLBACK_WHATSAPP}`;

  const shopLinks =
    categories.length > 0
      ? categories.map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` }))
      : DEFAULT_CATEGORIES;

  const socialLinks = [
    { href: social?.instagram || 'https://instagram.com/vrateez', icon: Instagram, label: 'Instagram' },
    { href: social?.facebook || 'https://facebook.com/vrateez', icon: Facebook, label: 'Facebook' },
    { href: social?.twitter || 'https://twitter.com/vrateez', icon: Twitter, label: 'Twitter' },
    { href: social?.youtube || 'https://youtube.com/@vrateez', icon: Youtube, label: 'YouTube' },
  ].filter((s) => Boolean(s.href));

  const pm = settings?.shipping?.paymentMethods;
  const trustPills = [
    { label: 'UPI', show: pm?.upi !== false },
    { label: 'Cards', show: pm?.cards !== false },
    { label: 'Net banking', show: pm?.netBanking !== false },
    { label: 'Cash on delivery', show: pm?.cod !== false },
    { label: 'FSSAI certified', show: true },
    { label: 'Secure checkout', show: true },
  ].filter((p) => p.show);

  const linkClass = 'group inline-flex items-center gap-1 text-sm text-parchment/60 transition hover:text-parchment';
  const arrowClass = 'opacity-0 -translate-y-0.5 transition group-hover:opacity-70';

  return (
    <footer className="relative overflow-hidden bg-ink text-parchment">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-turmeric/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-millet/5 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-turmeric/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-14 pb-8 md:px-8 md:pt-16 md:pb-10">
        {/* WhatsApp opt-in row */}
        <div className="mb-14 flex flex-col gap-6 rounded-[22px] bg-parchment/[0.05] p-6 ring-1 ring-parchment/10 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl">
            <p className="font-label text-[10px] tracking-[0.22em] uppercase text-millet/80">Stay in the loop</p>
            <h3 className="mt-2 font-display italic text-2xl leading-[1.05] text-parchment md:text-3xl">
              New launches and festival offers, straight to your WhatsApp.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-parchment/55">
              One message a fortnight at most. Vrat specials, fresh batches and bulk pricing before anyone else.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
            >
              <MessageCircle size={16} fill="currentColor" />
              Get updates on WhatsApp
            </a>
            <a
              href={emailHref}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-parchment ring-1 ring-parchment/20 transition hover:bg-parchment/10"
            >
              <Mail size={15} />
              Email us
            </a>
          </div>
        </div>

        {/* Columns */}
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="group mb-5 inline-flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-parchment/10 ring-1 ring-parchment/15">
                <Image src="/logo.png" alt="Vrateez" fill sizes="48px" className="object-contain p-1" />
              </div>
              <div>
                <p className="font-display italic text-2xl leading-none text-parchment transition group-hover:text-millet">
                  Vrateez
                </p>
                <p className="mt-1 font-label text-[9px] tracking-[0.22em] uppercase text-millet/80">
                  Nourish your fasting
                </p>
              </div>
            </Link>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-parchment/55">
              Clean-label, millet-based snacks baked fresh in small batches. Vrat friendly, honest ingredients, nothing to hide.
            </p>

            <div className="mb-7 space-y-2.5">
              <a href={whatsappChatHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-parchment/65 transition hover:text-millet">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-parchment/10 bg-parchment/8">
                  <MessageCircle size={14} className="text-millet" />
                </span>
                <span>WhatsApp us</span>
              </a>
              <a href={phoneHref} className="flex items-center gap-3 text-sm text-parchment/65 transition hover:text-millet">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-parchment/10 bg-parchment/8">
                  <Phone size={14} className="text-millet" />
                </span>
                <span>{phone}</span>
              </a>
              <a href={emailHref} className="flex items-center gap-3 text-sm text-parchment/65 transition hover:text-millet">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-parchment/10 bg-parchment/8">
                  <Mail size={14} className="text-millet" />
                </span>
                <span className="break-all">{email}</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-parchment/65">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-parchment/10 bg-parchment/8">
                  <MapPin size={14} className="text-millet" />
                </span>
                <span>{address}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-parchment/10 bg-parchment/8 transition-all hover:scale-105 hover:border-turmeric hover:bg-turmeric focus:outline-none focus-visible:ring-2 focus-visible:ring-millet/60"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:col-span-8">
            <div>
              <h4 className="mb-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-millet">Shop</h4>
              <nav className="space-y-2.5" aria-label="Shop by category">
                <Link href="/shop" className={linkClass}>
                  All products
                  <ArrowUpRight size={12} className={arrowClass} />
                </Link>
                {shopLinks.map((cat) => (
                  <Link key={cat.href} href={cat.href} className={`${linkClass} block`}>
                    {cat.label}
                    <ArrowUpRight size={12} className={arrowClass} />
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="mb-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-millet">Company</h4>
              <nav className="space-y-2.5" aria-label="Company">
                {COMPANY_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} className={`${linkClass} block`}>
                    {item.label}
                    <ArrowUpRight size={12} className={arrowClass} />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-millet">Why Vrateez</h4>
              <ul className="space-y-2.5 text-sm text-parchment/60">
                {WHY_VRATEEZ.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-basil text-parchment ring-1 ring-parchment/15">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/shop"
                className="pressable mt-6 inline-flex items-center gap-2 rounded-full bg-turmeric px-4 py-2.5 text-xs font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
              >
                Shop now
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Payment / trust pills */}
        <div className="flex flex-col gap-3 border-t border-parchment/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-label text-[10px] tracking-[0.22em] uppercase text-parchment/40">We accept</p>
          <ul className="flex flex-wrap gap-2">
            {trustPills.map((pill) => (
              <li
                key={pill.label}
                className="rounded-full bg-parchment/[0.05] px-3 py-1.5 font-label text-[10px] tracking-[0.18em] uppercase text-parchment/70 ring-1 ring-parchment/15"
              >
                {pill.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-parchment/10 pt-8">
          <p className="mb-6 select-none text-center font-display text-5xl tracking-[0.18em] text-parchment/[0.06] md:text-7xl">
            VRATEEZ
          </p>
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-parchment/35 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Vrateez Foods Pvt. Ltd. All rights reserved.</p>
            <nav className="flex items-center gap-4" aria-label="Footer">
              {BOTTOM_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-parchment">
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="text-parchment/30">Handcrafted in {address}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
