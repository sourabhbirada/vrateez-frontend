'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift, MessageCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function FinalCtaSection() {
  const { settings } = useSettings();
  const threshold = settings?.shipping?.freeShippingThreshold ?? 499;
  const whatsapp = (settings?.contact?.whatsapp || '916375010189').replace(/\D/g, '');
  const waHref = `https://wa.me/${whatsapp.length === 10 ? `91${whatsapp}` : whatsapp}?text=${encodeURIComponent('Hi Vrateez! Help me pick the right snacks.')}`;

  return (
    <section className="relative overflow-hidden bg-ink text-parchment">
      <div className="absolute inset-0">
        <Image src="/virteez/All three infused cookies.jpeg" alt="" fill className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28" data-reveal>
        <p className="font-label text-[10px] tracking-[0.24em] uppercase text-millet/80 mb-4">Ready when you are</p>
        <h2 className="font-display italic text-4xl md:text-6xl leading-[1.02] max-w-2xl">Snack smarter this season.</h2>
        <p className="mt-5 text-parchment/65 max-w-lg text-[15px] leading-relaxed">
          Free delivery above ₹{threshold}, cash on delivery available, and a real human on WhatsApp if you need help choosing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-turmeric px-7 py-3.5 text-sm font-semibold text-parchment shadow-lg shadow-turmeric/25 transition hover:bg-clay"
          >
            Shop bestsellers
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/occasions"
            className="inline-flex items-center gap-2 rounded-full bg-parchment/10 ring-1 ring-parchment/20 px-6 py-3.5 text-sm font-semibold text-parchment hover:bg-parchment/20 transition"
          >
            <Gift size={15} className="text-millet" /> Fasts &amp; festivals
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-parchment/80 hover:text-parchment transition"
          >
            <MessageCircle size={15} className="text-[#25D366]" /> WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
