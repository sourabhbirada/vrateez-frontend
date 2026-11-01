'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import type { Faq } from '@/lib/api/types';
import { useSettings, whatsappLink } from '@/context/SettingsContext';

type FaqGroup = { key: string; label: string; items: Faq[] };

const groupDomId = (key: string) => `faq-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

function HelpCard({ wa, email }: { wa: string | null; email?: string }) {
    return (
        <div className="rounded-[22px] bg-ink p-6 text-parchment">
            <p className="mb-2 font-label text-[10px] tracking-[0.2em] uppercase text-millet/80">Still stuck?</p>
            <p className="font-display italic text-2xl leading-tight">Ask a human.</p>
            <p className="mt-2 text-sm leading-relaxed text-parchment/65">
                WhatsApp us and a real person replies, usually within the hour.
            </p>
            <div className="mt-4 flex flex-col gap-2">
                {wa ? (
                    <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pressable inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#1ebe5d]"
                    >
                        <MessageCircle size={16} />
                        WhatsApp us
                    </a>
                ) : null}
                {email ? (
                    <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-parchment/10 px-5 py-3 text-sm font-semibold text-parchment ring-1 ring-parchment/15 transition hover:bg-parchment/20"
                    >
                        <Mail size={15} />
                        <span className="truncate">{email}</span>
                    </a>
                ) : null}
                <Link
                    href="/track-order"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-parchment/60 transition hover:text-parchment"
                >
                    Track an order instead
                    <ArrowRight size={13} />
                </Link>
            </div>
        </div>
    );
}

/**
 * FAQ page body. Questions come from the server page (CMS FAQs, or the built-in set when
 * the CMS is empty), so every question and answer is in the HTML.
 */
export default function FaqClient({ initialFaqs }: { initialFaqs: Faq[] }) {
    const faqs = initialFaqs;
    const [activeCategory, setActiveCategory] = useState<string>(initialFaqs[0]?.category ?? '');
    const [openId, setOpenId] = useState<string | null>(initialFaqs[0]?._id ?? null);
    const loaded = true;
    const { settings } = useSettings();
    const wa = whatsappLink(settings?.contact?.whatsapp, 'Hi Vrateez! I have a question the FAQ did not answer.');
    const email = settings?.contact?.supportEmail;

    const groups = useMemo<FaqGroup[]>(() => {
        const byKey = new Map<string, FaqGroup>();
        faqs.forEach((faq) => {
            const existing = byKey.get(faq.category);
            if (existing) existing.items.push(faq);
            else byKey.set(faq.category, { key: faq.category, label: faq.category, items: [faq] });
        });
        return Array.from(byKey.values());
    }, [faqs]);

    // Keep the topic rail in sync while scrolling through the groups.
    useEffect(() => {
        if (!groups.length) return;
        const els = groups
            .map((g) => document.getElementById(groupDomId(g.key)))
            .filter((el): el is HTMLElement => Boolean(el));
        if (!els.length) return;
        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) {
                    const key = (visible.target as HTMLElement).dataset.category;
                    if (key) setActiveCategory(key);
                }
            },
            { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [groups]);

    const jumpTo = (key: string) => {
        setActiveCategory(key);
        document.getElementById(groupDomId(key))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const total = faqs.length;

    return (
        <main className="min-h-screen bg-parchment">
            {/* Hero */}
            <section className="relative overflow-hidden bg-ink text-parchment">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #E4A93D 0%, transparent 45%)' }}
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display italic text-[220px] leading-none text-parchment/[0.05] md:right-12 md:text-[320px]"
                >
                    ?
                </span>
                <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-20 md:pt-16 md:pb-24">
                    <p className="mb-3 font-label text-[10px] tracking-[0.24em] uppercase text-millet/80">Support</p>
                    <h1 className="font-display italic text-4xl md:text-5xl leading-[1.05]">Questions, answered.</h1>
                    <p className="mt-3 max-w-lg text-[15px] text-parchment/65">
                        Ordering, shipping, ingredients and vrat rules. If it is not here, message us and a real person replies.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-12 md:-mt-14 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
                    {/* Topic rail */}
                    <aside className="space-y-4 lg:sticky lg:top-28">
                        <nav
                            aria-label="FAQ topics"
                            className="rounded-[22px] bg-white p-2 ring-1 ring-ink/[0.08] shadow-[0_30px_70px_-45px_rgba(36,31,22,0.5)] lg:p-3"
                        >
                            <p className="hidden px-3 pb-2 pt-2 font-label text-[10px] tracking-[0.2em] uppercase text-clay lg:block">
                                Browse by topic
                            </p>
                            {loaded && groups.length ? (
                                <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col">
                                    {groups.map((g) => {
                                        const active = activeCategory === g.key;
                                        return (
                                            <li key={g.key} className="shrink-0 lg:shrink">
                                                <button
                                                    type="button"
                                                    onClick={() => jumpTo(g.key)}
                                                    aria-current={active ? 'true' : undefined}
                                                    className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-4 py-2 text-left text-sm font-semibold transition lg:rounded-xl ${
                                                        active ? 'bg-ink text-parchment' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                                                    }`}
                                                >
                                                    <span className="capitalize">{g.label}</span>
                                                    <span className={`hidden font-label text-[10px] lg:inline ${active ? 'text-millet' : 'text-ink/35'}`}>
                                                        {g.items.length}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="flex gap-2 p-1 lg:flex-col">
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} className="h-9 w-28 animate-pulse rounded-full bg-ink/5 lg:w-full lg:rounded-xl" />
                                    ))}
                                </div>
                            )}
                        </nav>
                        <div className="hidden lg:block">
                            <HelpCard wa={wa} email={email} />
                        </div>
                    </aside>

                    {/* Groups */}
                    <div className="space-y-8">
                        {!loaded ? (
                            <div className="space-y-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-[22px] bg-white/70 ring-1 ring-ink/[0.06]" />
                                ))}
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="rounded-[22px] bg-white p-10 text-center ring-1 ring-ink/[0.08]">
                                <p className="font-display italic text-2xl text-ink">Nothing here yet.</p>
                                <p className="mt-2 text-sm text-ink/55">We are still writing these up. Message us in the meantime.</p>
                            </div>
                        ) : (
                            <>
                                <p className="px-1 text-xs text-ink/45">
                                    {total} answer{total === 1 ? '' : 's'} across {groups.length} topic{groups.length === 1 ? '' : 's'}
                                </p>
                                {groups.map((group) => (
                                    <section
                                        key={group.key}
                                        id={groupDomId(group.key)}
                                        data-category={group.key}
                                        className="scroll-mt-28"
                                        data-reveal
                                    >
                                        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
                                            <h2 className="font-display italic text-2xl capitalize text-ink md:text-3xl">{group.label}</h2>
                                            <span className="shrink-0 text-xs text-ink/40">
                                                {group.items.length} question{group.items.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <ul className="divide-y divide-ink/[0.08] overflow-hidden rounded-[24px] bg-white ring-1 ring-ink/[0.08]">
                                            {group.items.map((faq) => {
                                                const isOpen = openId === faq._id;
                                                return (
                                                    <li key={faq._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenId(isOpen ? null : faq._id)}
                                                            aria-expanded={isOpen}
                                                            className={`flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left transition-colors md:px-6 ${
                                                                isOpen ? 'bg-turmeric/[0.05]' : 'hover:bg-ink/[0.03]'
                                                            }`}
                                                        >
                                                            <span className="py-1 text-[15px] font-medium text-ink">{faq.question}</span>
                                                            <ChevronDown
                                                                size={18}
                                                                className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-turmeric' : 'text-ink/40'}`}
                                                            />
                                                        </button>
                                                        <div
                                                            className={`grid transition-[grid-template-rows] duration-300 ${
                                                                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                            }`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-ink/60 md:px-6">
                                                                    {faq.answer}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>
                                ))}
                            </>
                        )}

                        <div className="lg:hidden" data-reveal>
                            <HelpCard wa={wa} email={email} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
