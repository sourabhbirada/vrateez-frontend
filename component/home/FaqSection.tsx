'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getFaqsApi } from '@/lib/api/faqApi';
import type { Faq } from '@/lib/api/types';
import { DEFAULT_FAQS } from '@/lib/seoFaqs';


export default function FaqSection() {
  const { settings } = useSettings();
  const [faqs, setFaqs] = useState<Array<Pick<Faq, 'question' | 'answer'>>>(DEFAULT_FAQS);
  const [open, setOpen] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    getFaqsApi()
      .then((items) => {
        if (!cancelled && items.length) setFaqs(items.slice(0, 7));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const whatsapp = (settings?.contact?.whatsapp || '916375010189').replace(/\D/g, '');
  const waHref = `https://wa.me/${whatsapp.length === 10 ? `91${whatsapp}` : whatsapp}?text=${encodeURIComponent('Hi Vrateez! I have a question before ordering.')}`;

  return (
    <section className="bg-parchment py-16 md:py-20" id="faq">
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-28" data-reveal>
          <p className="font-label text-[10px] tracking-[0.24em] uppercase text-clay mb-3">Before you order</p>
          <h2 className="font-display italic text-4xl md:text-5xl text-ink leading-none">Questions, answered.</h2>
          <p className="mt-4 text-[15px] text-ink/55 max-w-sm">
            Still unsure? Message us on WhatsApp and a real person replies, usually within the hour.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-ink hover:bg-[#1ebe5d] transition"
            >
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
            <Link href="/faq" className="inline-flex items-center gap-2 rounded-full ring-1 ring-ink/15 px-5 py-3 text-sm font-semibold text-ink hover:bg-ink/5 transition">
              All FAQs
            </Link>
          </div>
        </div>

        <ul className="divide-y divide-ink/[0.08] rounded-[24px] bg-white ring-1 ring-ink/[0.08] overflow-hidden" data-reveal data-reveal-delay="120">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={`${f.question}-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 md:px-6 py-4.5 text-left"
                >
                  <span className="font-medium text-ink text-[15px] py-1">{f.question}</span>
                  <ChevronDown size={18} className={`shrink-0 text-ink/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 text-sm text-ink/60 leading-relaxed">{f.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
