'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Copy, Check, MessageCircle, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { trackLead } from '@/lib/analytics';
import { activityTracker } from '@/lib/activityTracker';

const SEEN_KEY = 'vrateez_welcome_seen_at';
const SNOOZE_DAYS = 7;
const COUPON = process.env.NEXT_PUBLIC_WELCOME_COUPON || '';
const COUPON_TEXT = process.env.NEXT_PUBLIC_WELCOME_COUPON_TEXT || '';

/**
 * First-visit offer. Shows once per week, after the cookie choice, on half-page scroll, 25 seconds or exit intent.
 * With NEXT_PUBLIC_WELCOME_COUPON set it promotes that code (create it in the CMS first);
 * otherwise it pushes free delivery and the WhatsApp offers list.
 */
export default function WelcomeOffer() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let seen = 0;
    try {
      seen = Number(localStorage.getItem(SEEN_KEY) || 0);
    } catch {
      /* ignore */
    }
    if (seen && Date.now() - seen < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;

    let shown = false;
    // Never stack the offer on top of the cookie banner: wait until the visitor has answered it.
    const consentAnswered = () => activityTracker.getCookieConsent() !== null;
    const show = () => {
      if (shown || !consentAnswered()) return;
      shown = true;
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    };
    // Show after real engagement (half the page scrolled, or 25 seconds) or on exit intent,
    // instead of a fixed 8 seconds that interrupts the first screen on phones.
    const timer = window.setTimeout(show, 25_000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) show();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!open) return null;

  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const whatsapp = (settings?.contact?.whatsapp || '916375010189').replace(/\D/g, '');
  const waHref = `https://wa.me/${whatsapp.length === 10 ? `91${whatsapp}` : whatsapp}?text=${encodeURIComponent('Hi Vrateez! Add me to your offers list please.')}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-ink/50 backdrop-blur-[2px] animate-fadeIn" role="dialog" aria-modal="true" aria-label="Welcome offer">
      <div className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-parchment shadow-2xl ring-1 ring-ink/10">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-parchment hover:bg-ink"
        >
          <X size={16} />
        </button>

        <div className="relative h-40">
          <Image src="/virteez/Assorted cookie box.jpeg" alt="Vrateez millet cookie gift boxes" fill className="object-cover" sizes="448px" />
          <div className="absolute inset-0 bg-linear-to-t from-parchment via-parchment/20 to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-6 relative">
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-2">Welcome to Vrateez</p>
          {COUPON ? (
            <>
              <h3 className="font-display italic text-3xl text-ink leading-tight">{COUPON_TEXT || 'A little something for your first order.'}</h3>
              <button
                type="button"
                onClick={copy}
                className="mt-4 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-turmeric/60 bg-white px-4 py-3"
              >
                <span className="font-label text-lg tracking-[0.18em] text-ink">{COUPON}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-turmeric px-2.5 py-1 text-[11px] font-semibold text-parchment">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
              <p className="mt-2 text-xs text-ink/50">Paste it in the coupon box at checkout.</p>
            </>
          ) : (
            <>
              <h3 className="font-display italic text-3xl text-ink leading-tight">Free delivery above ₹{threshold}.</h3>
              <p className="mt-2 text-sm text-ink/60">
                Build a box of bestsellers and shipping is on us. Join our WhatsApp list for festive offers first.
              </p>
            </>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-turmeric px-5 py-3 text-sm font-semibold text-parchment hover:bg-clay transition"
            >
              Shop now <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead('welcome_whatsapp')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-ink hover:bg-[#1ebe5d] transition"
            >
              <MessageCircle size={15} /> Offers on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
